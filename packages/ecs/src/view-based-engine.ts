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

  constructor(
    private views: EntitiesGroupedInViews,
    private shouldDoRuntimeChecks: boolean
  ) {}

  get<T>(component: Component<T>): T {
    if (!this.has(component)) {
      throw new Error("Entity does not contain the requested component");
    }
    return this.state[component.componentId] as T;
  }

  has(component: Component<any>): boolean {
    return this.state.hasOwnProperty(component.componentId);
  }

  remove(component: Component<any>): Entity {
    const hadComponent = this.has(component);
    if (hadComponent) {
      delete this.state[component.componentId];
      this.views.componentRemovedFrom(this);
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
      this.views.componentAddedTo(this);
    }

    return this;
  }

  setFlag(flag: Flag): Entity {
    this.set(flag, flagMarker);
    return this;
  }
}

class EntitiesGroupedInViews implements Entities {
  private entityViews = new Map<Entity, Set<View<any>>>();
  private allViews: View<any>[] = [];

  viewToMatch<Q extends Query>(query: Q): View<Q> {
    return this.existingViewToHandle(query) || this.newViewToHandle(query);
  }

  add(entity: ViewsAwareEntity) {
    this.entityViews.set(entity, new Set());
  }

  remove(entity: ViewsAwareEntity) {
    for (const view of this.entityViews.get(entity)!) {
      view.remove(entity);
    }

    this.entityViews.delete(entity);
  }

  componentAddedTo(entity: ViewsAwareEntity) {
    for (const view of this.allViews) {
      if (view.test(entity)) {
        this.entityViews.get(entity)!.add(view);
      }
    }
  }

  componentRemovedFrom(entity: ViewsAwareEntity) {
    const containingViews = this.entityViews.get(entity)!;
    for (const view of containingViews) {
      if (!view.retest(entity)) {
        containingViews.delete(view);
      }
    }
  }

  thatHave<Q extends Query>(query: Q): Result<Q> {
    return this.viewToMatch(query).getAllEntities();
  }

  private existingViewToHandle<Q extends Query>(query: Q): View<Q> | undefined {
    return this.allViews.find((view) => view.handles(query));
  }

  private newViewToHandle<Q extends Query>(query: Q): View<Q> {
    const newView = new View<Q>(query);

    for (const entity of this.entityViews.keys()) {
      if (newView.test(entity as ViewsAwareEntity)) {
        this.entityViews.get(entity)!.add(newView);
      }
    }

    this.allViews.push(newView);
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
    const componentIdsInQuery = this.componentIdsIn(query);
    return (
      this.componentIds.length === componentIdsInQuery.length &&
      this.componentIds.every((name) => componentIdsInQuery.includes(name))
    );
  }

  getAllEntities(): Result<Q> {
    return this.result;
  }

  test(entity: ViewsAwareEntity): boolean {
    if (this.queryIsMatchedBy(entity.state)) {
      this.result.set(entity, entity.state);
      return true;
    }

    return false;
  }

  retest(entity: ViewsAwareEntity): boolean {
    if (!this.queryIsMatchedBy(entity.state)) {
      this.remove(entity);
      return false;
    }

    return true;
  }

  remove(entity: ViewsAwareEntity): void {
    this.result.delete(entity);
  }

  private queryIsMatchedBy(state: EntityState): state is QueriedState<Q> {
    return this.componentIds.every((componentName) =>
      state.hasOwnProperty(componentName)
    );
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
    let newEntity = new ViewsAwareEntity(this.entities, this.config.typeChecks);
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
}
