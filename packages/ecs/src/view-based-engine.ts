import { Engine, EngineConfig } from './engine';
import { Entity } from './entity';
import { Query, Result, System } from './system';
import { Component, Flag } from './component';

interface SystemWithView {
  system: System<any>;
  view: View;
}

const flagMarker = {};

function typeCheck(component: Component<unknown>, input: unknown) {
  if (component.typeGuard && !component.typeGuard(input)) {
    const json = JSON.stringify(input);
    throw new Error(
      `Could not set component because the data did not pass runtime type check: ${json}`
    );
  }
};

class ViewsAwareEntity implements Entity {
  data: Result<Query> = {};
  containingViews = new Set<View>();

  constructor(
    private engine: ViewBasedEngine,
    private shouldDoRuntimeChecks: boolean
  ) {}

  get<T>(component: Component<T>): Readonly<T> {
    if (!this.data.hasOwnProperty(component.componentId)) {
      throw new Error("Entity does not contain the requested component");
    }
    return this.data[component.componentId] as Readonly<T>;
  }

  has(component: Component<any>): boolean {
    return this.data.hasOwnProperty(component.componentId);
  }

  remove(component: Component<any>): Entity {
    const hadComponent = this.has(component);
    if (hadComponent) {
      delete this.data[component.componentId];
      this.containingViews.forEach((view) => view.retest(this));
    }
    return this;
  }

  set<T>(component: Component<T>, data: T): Entity {
    if(this.shouldDoRuntimeChecks){
      typeCheck(component, data);
    }

    const isNewComponent = !this.has(component);
    this.data[component.componentId] = data;

    if (isNewComponent) {
      this.engine.componentAdded(this);
    }

    return this;
  }

  setFlag(flag: Flag): Entity {
    this.set(flag, flagMarker);
    return this;
  }
}

class Views {
  private views: View[] = [];
  private entities= new Set<ViewsAwareEntity>();

  viewToMatch(query: Query): View {
    return this.existingViewToHandle(query) || this.newViewToHandle(query);
  }

  add(entity: ViewsAwareEntity) {
    this.entities.add(entity);
  }

  remove(entity: ViewsAwareEntity) {
    this.entities.delete(entity);

    for (const view of entity.containingViews) {
      view.remove(entity);
    }
  }

  private existingViewToHandle(query: Query): View | undefined {
    return this.views.find((view) => view.handles(query));
  }

  private newViewToHandle(query: Query): View {
    const newView = new View(query);

    for (const entity of this.entities) {
      newView.test(entity);
    }

    this.views.push(newView);
    return newView;
  }

  componentAddedTo(entity: ViewsAwareEntity) {
    for (const view of this.views) {
      view.test(entity);
    }
  }
}

class View {
  private readonly matchedEntities = new Set<ViewsAwareEntity>();
  private readonly componentNames: string[];

  constructor(private query: Query) {
    this.componentNames = this.componentNamesIn(query);
  }

  handles(query: Query): boolean {
    const componentNamesInQuery = this.componentNamesIn(query);
    return (
      this.componentNames.length === componentNamesInQuery.length &&
      this.componentNames.every((name) => componentNamesInQuery.includes(name))
    );
  }

  forEach(act: (entity: Entity, data: any) => void): void {
    for (const entity of this.matchedEntities) {
      act(entity, entity.data);
    }
  }

  test(entity: ViewsAwareEntity): void {
    if (this.queryIsMatchedBy(entity)) {
      this.matchedEntities.add(entity);
      entity.containingViews.add(this);
    }
  }

  retest(entity: ViewsAwareEntity): void {
    if (!this.queryIsMatchedBy(entity)) {
      this.remove(entity);
      entity.containingViews.delete(this);
    }
  }

  remove(entity: ViewsAwareEntity): void {
    this.matchedEntities.delete(entity);
  }

  private queryIsMatchedBy(entity: ViewsAwareEntity) {
    return this.componentNames.every((componentName) =>
      entity.data.hasOwnProperty(componentName)
    );
  }

  private componentNamesIn(query: Query) {
    return Object.keys(query);
  }
}

export class ViewBasedEngine implements Engine {
  private views = new Views();
  private systems: SystemWithView[] = [];

  constructor(private config: EngineConfig) {}

  createEntity(): Entity {
    let newEntity = new ViewsAwareEntity(this, this.config.typeChecks);
    this.views.add(newEntity);
    return newEntity;
  }

  defineSystem<Q extends Query>(system: System<Q>): Engine {
    if (!system.query) {
      throw new Error(
        "Could not define the system because its query is undefined. Are the components you are trying to use defined before the system?"
      );
    }

    const view = this.views.viewToMatch(system.query);
    this.systems.push({ system, view });
    return this;
  }

  remove(entity: Entity): void {
    this.views.remove(entity as ViewsAwareEntity);
  }

  tick(): void {
    const deltaTime = this.config.stopwatch.deltaTimeSinceLastTick;

    for (const { system, view } of this.systems) {
      if (system.tick) {
        system.tick(deltaTime);
      }

      view.forEach((entity, data) => {
        system.run(entity, data);
      });
    }
  }

  componentAdded(entity: ViewsAwareEntity) {
    this.views.componentAddedTo(entity);
  }
}
