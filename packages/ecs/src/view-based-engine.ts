import { Engine, EngineConfig } from "./engine";
import { Entity } from "./entity";
import { System } from "./system";
import { Component, Flag } from "./component";
import { Entities, QueriedState, Query, Result } from "./entities";
import { performance } from "perf_hooks";

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
  internalState = new Map<string, any>();
  private cachedStateObject: EntityState | null = null;

  containingViews = new Set<View<any>>();

  get state() {
    if (!this.cachedStateObject) {
      this.cachedStateObject = Object.fromEntries(this.internalState.entries());
    }
    return this.cachedStateObject;
  }

  constructor(
    private engine: ViewBasedEngine,
    private shouldDoRuntimeChecks: boolean
  ) {}

  get<T>(component: Component<T>): Readonly<T> {
    if (!this.has(component)) {
      throw new Error("Entity does not contain the requested component");
    }
    return this.internalState.get(component.componentId) as Readonly<T>;
  }

  has(component: Component<any>): boolean {
    return this.internalState.has(component.componentId);
  }

  remove(component: Component<any>): Entity {
    const hadComponent = this.has(component);
    if (hadComponent) {
      this.internalState.delete(component.componentId);
      this.cachedStateObject = null;
      this.containingViews.forEach((view) => view.retest(this));
    }
    return this;
  }

  set<T>(component: Component<T>, data: T): Entity {
    // performance.mark("Setting component");
    if (this.shouldDoRuntimeChecks) {
      typeCheck(component, data);
    }

    const isNewComponent = !this.has(component);
    this.internalState.set(component.componentId, data);
    this.cachedStateObject = null;

    if (isNewComponent) {
      this.engine.componentAdded(this);
    }

    // performance.mark("Component set");
    // performance.measure(
    //   "Setting components",
    //   "Setting component",
    //   "Component set"
    // );
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
  private readonly componentIds: string[];

  constructor(private query: Query) {
    this.componentIds = this.componentIdsIn(query);
  }

  handles(query: Query): boolean {
    // performance.mark('check query')
    const componentIdsInQuery = this.componentIdsIn(query);
    const result =
      this.componentIds.length === componentIdsInQuery.length &&
      this.componentIds.every((name) => componentIdsInQuery.includes(name));
    // performance.mark('query checked')
    // performance.measure('checking queries', 'check query', 'query checked')
    return result;
  }

  getAllEntities(): Result<Q> {
    return this.result;
  }

  test(entity: ViewsAwareEntity): void {
    // performance.mark('test')
    if (this.queryIsMatchedBy(entity.internalState)) {
      // TODO: avoid the need for cast
      this.result.set(entity, entity.state as QueriedState<Q>);
      entity.containingViews.add(this);
    }
    // performance.mark('end test')
    // performance.measure('testing', 'test', 'end test');
  }

  retest(entity: ViewsAwareEntity): void {
    if (!this.queryIsMatchedBy(entity.internalState)) {
      this.remove(entity);
      entity.containingViews.delete(this);
    }
  }

  remove(entity: ViewsAwareEntity): void {
    this.result.delete(entity);
  }

  private queryIsMatchedBy(state: Map<string, any>) {
    return this.componentIds.every((componentName) => state.has(componentName));
  }

  private componentIdsIn(query: Query) {
    return Object.keys(query);
  }
}

export class ViewBasedEngine implements Engine {
  private entities = new EntitiesGroupedInViews();
  private systems: System[] = [];

  constructor(private config: EngineConfig) {}

  createEntity(): Entity {
    // performance.mark("Creating entity");
    let newEntity = new ViewsAwareEntity(this, this.config.typeChecks);
    this.entities.add(newEntity);
    // performance.mark("Entity created");
    // performance.measure("Entity creation", "Creating entity", "Entity created");
    return newEntity;
  }

  defineSystem(system: System): Engine {
    this.systems.push(system);
    return this;
  }

  remove(entity: Entity): void {
    // performance.mark("Removing entity");
    this.entities.remove(entity as ViewsAwareEntity);
    // performance.mark("Entity removed");
    // performance.measure("Entity removal", "Removing entity", "Entity removed");
  }

  tick(): void {
    const deltaTime = this.config.stopwatch.deltaTimeSinceLastTick;

    // performance.mark('Run all systems')
    for (const system of this.systems) {
      system.run(this.entities, deltaTime);
    }
    // performance.mark('All systems have run')
    // performance.measure('Running systems', 'Run all systems', 'All systems have run');
  }

  componentAdded(entity: ViewsAwareEntity) {
    this.entities.componentAddedTo(entity);
  }
}
