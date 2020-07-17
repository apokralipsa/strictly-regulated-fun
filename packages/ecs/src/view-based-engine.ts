import { Engine, EngineConfig } from "./engine";
import { Entity } from "./entity";
import { System } from "./system";
import { Component, Flag } from "./component";
import { Entities, QueriedState, Query, Result } from "./entities";

const flagMarker = {};

function typeCheck(component: Component<unknown>, input: unknown) {
  if (component.typeGuard && !component.typeGuard(input)) {
    const json = JSON.stringify(input);
    throw new Error(
      `Could not set component because the data did not pass runtime type check: ${json}`
    );
  }
}

type EntityState = {
  [key: string]: any;
};

class ViewsAwareEntity implements Entity {
  state: EntityState = {};
  containingViews = new Set<View<any>>();

  constructor(
    private engine: ViewBasedEngine,
    private shouldDoRuntimeChecks: boolean
  ) {}

  get<T>(component: Component<T>): Readonly<T> {
    if (!this.state.hasOwnProperty(component.componentId)) {
      throw new Error("Entity does not contain the requested component");
    }
    return this.state[component.componentId] as Readonly<T>;
  }

  has(component: Component<any>): boolean {
    return this.state.hasOwnProperty(component.componentId);
  }

  remove(component: Component<any>): Entity {
    const hadComponent = this.has(component);
    if (hadComponent) {
      delete this.state[component.componentId];
      this.containingViews.forEach((view) => view.retest(this));
    }
    return this;
  }

  set<T>(component: Component<T>, data: T): Entity {
    if (this.shouldDoRuntimeChecks) {
      typeCheck(component, data);
    }

    const isNewComponent = !this.has(component);
    this.state[component.componentId] = data;

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

class EntitiesGroupedInViews implements Entities {
  private views: View<any>[] = [];
  private entities = new Set<ViewsAwareEntity>();

  viewToMatch<Q extends Query>(query: Q): View<Q> {
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

  componentAddedTo(entity: ViewsAwareEntity) {
    for (const view of this.views) {
      view.test(entity);
    }
  }

  findWith<Q extends Query>(query: Q): Result<Q> {
    return this.viewToMatch(query).getAllEntities();
  }

  private existingViewToHandle<Q extends Query>(query: Q): View<Q> | undefined {
    return this.views.find((view) => view.handles(query));
  }

  private newViewToHandle<Q extends Query>(query: Q): View<Q> {
    const newView = new View<Q>(query);

    for (const entity of this.entities) {
      newView.test(entity);
    }

    this.views.push(newView);
    return newView;
  }
}

class View<Q extends Query> {
  private readonly result: Result<Q> = new Map<Entity, QueriedState<Q>>();
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

  getAllEntities(): Result<Q> {
    return this.result;
  }

  test(entity: ViewsAwareEntity): void {
    if (this.queryIsMatchedBy(entity.state)) {
      this.result.set(entity, entity.state);
      entity.containingViews.add(this);
    }
  }

  retest(entity: ViewsAwareEntity): void {
    if (!this.queryIsMatchedBy(entity.state)) {
      this.remove(entity);
      entity.containingViews.delete(this);
    }
  }

  remove(entity: ViewsAwareEntity): void {
    this.result.delete(entity);
  }

  private queryIsMatchedBy(state: EntityState): state is QueriedState<Q> {
    return this.componentNames.every((componentName) =>
      state.hasOwnProperty(componentName)
    );
  }

  private componentNamesIn(query: Query) {
    return Object.keys(query);
  }
}

export class ViewBasedEngine implements Engine {
  private entities = new EntitiesGroupedInViews();
  private systems: System[] = [];

  constructor(private config: EngineConfig) {}

  createEntity(): Entity {
    let newEntity = new ViewsAwareEntity(this, this.config.typeChecks);
    this.entities.add(newEntity);
    return newEntity;
  }

  defineSystem(system: System): Engine {
    this.systems.push(system);
    return this;
  }

  remove(entity: Entity): void {
    this.entities.remove(entity as ViewsAwareEntity);
  }

  tick(): void {
    const deltaTime = this.config.stopwatch.deltaTimeSinceLastTick;

    for (const system of this.systems) {
      system.run(this.entities, deltaTime);
    }
  }

  componentAdded(entity: ViewsAwareEntity) {
    this.entities.componentAddedTo(entity);
  }
}
