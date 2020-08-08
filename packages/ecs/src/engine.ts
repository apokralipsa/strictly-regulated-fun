import { Entity } from "./entity";
import { System } from "./system";
import { EventEmitter, Events, Subscription } from "./events";
import { defaultStopwatch, Stopwatch } from "./stopwatch";
import { Entities, QueriedState, Query } from "./entities";
import { Component, Flag } from "./component";

/**
 * Central class of the library.
 * Use an Engine to create / remove entities and define systems.
 */
export interface Engine {
  createEntity(): Entity;
  defineSystem(system: System): Engine;

  /**
   * Runs all defined systems one time, in the order they were defined.
   * Call this method once every frame.
   */
  tick(): Engine;
  remove(entity: Entity): Engine;
}

export interface EngineConfig {
  typeChecks: boolean;
  stopwatch: Stopwatch;
}

const createDefaultEngineConfig: () => EngineConfig = () => ({
  typeChecks: true,
  stopwatch: defaultStopwatch(),
});

export function createEngine(config: Partial<EngineConfig> = {}): Engine {
  return new ViewBasedEngine({ ...createDefaultEngineConfig(), ...config });
}

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

type EntityEventType = "componentAdded" | "componentRemoved";

class EmittingEntity implements Entity {
  state: EntityState = {};
  private readonly eventEmitter = new EventEmitter<
    EntityEventType,
    EmittingEntity
  >(this);

  constructor(private shouldDoRuntimeChecks: boolean) {}

  events(): Events<EntityEventType, EmittingEntity> {
    return this.eventEmitter;
  }

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
      this.eventEmitter.emit("componentRemoved");
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
      this.eventEmitter.emit("componentAdded");
    }

    return this;
  }

  setFlag(flag: Flag): Entity {
    this.set(flag, flagMarker);
    return this;
  }
}

type EntitySubscription = Subscription<EntityEventType, EmittingEntity>;

class EntityViews implements Entities {
  private allEntities: Set<EmittingEntity> = new Set<EmittingEntity>();
  private allViews: View<any>[] = [];
  private subscriptions: Map<EmittingEntity, EntitySubscription> = new Map();

  add(newEntity: EmittingEntity) {
    this.informAllViewsAbout(newEntity);
    this.allEntities.add(newEntity);

    const subscription = newEntity
      .events()
      .subscribeTo("componentAdded", (event) =>
        this.informAllViewsAbout(event.source)
      );

    this.subscriptions.set(newEntity, subscription);
  }

  viewToMatch<Q extends Query>(query: Q): View<Q> {
    return this.existingViewToHandle(query) || this.newViewToHandle(query);
  }

  remove(entity: EmittingEntity) {
    this.allViews.forEach((view) => view.remove(entity));
    this.allEntities.delete(entity);
    this.subscriptions.delete(entity);
  }

  thatHave<Q extends Query>(query: Q): ReadonlyMap<Entity, QueriedState<Q>> {
    return this.viewToMatch(query).getAllEntities();
  }

  private informAllViewsAbout(entity: EmittingEntity) {
    this.allViews.forEach((view) => view.addIfMatches(entity));
  }

  private existingViewToHandle<Q extends Query>(query: Q): View<Q> | undefined {
    return this.allViews.find((view) => view.handles(query));
  }

  private newViewToHandle<Q extends Query>(query: Q): View<Q> {
    const newView = new View<Q>(query);

    for (const entity of this.allEntities) {
      newView.addIfMatches(entity as EmittingEntity);
    }

    this.allViews.push(newView);
    return newView;
  }
}

class View<Q extends Query> {
  private readonly result: Map<Entity, QueriedState<Q>> = new Map();
  private readonly subscriptions: Map<Entity, EntitySubscription> = new Map();
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

  getAllEntities(): Map<Entity, QueriedState<Q>> {
    return this.result;
  }

  addIfMatches(entity: EmittingEntity) {
    if (this.queryIsMatchedBy(entity.state)) {
      this.result.set(entity, entity.state);
      const subscription = entity
        .events()
        .subscribeTo("componentRemoved", (event) =>
          this.removeIfNoLongerMatches(event.source)
        );

      this.subscriptions.set(entity, subscription);
    }
  }

  remove(entity: EmittingEntity): void {
    this.result.delete(entity);
    this.subscriptions.delete(entity);
  }

  private queryIsMatchedBy(state: EntityState): state is QueriedState<Q> {
    return this.componentIds.every((componentName) =>
      state.hasOwnProperty(componentName)
    );
  }

  private componentIdsIn(query: Query) {
    return Object.values(query).map((component) => component.componentId);
  }

  private removeIfNoLongerMatches(entity: EmittingEntity) {
    if (!this.queryIsMatchedBy(entity.state)) {
      this.remove(entity);
    }
  }
}

class ViewBasedEngine implements Engine {
  private entities = new EntityViews();
  private systems: System[] = [];

  constructor(private config: EngineConfig) {}

  createEntity(): Entity {
    let newEntity = new EmittingEntity(this.config.typeChecks);
    this.entities.add(newEntity);
    return newEntity;
  }

  defineSystem(system: System): Engine {
    this.systems.push(system);
    return this;
  }

  remove(entity: Entity): Engine {
    this.entities.remove(entity as EmittingEntity);
    return this;
  }

  tick(): Engine {
    const deltaTime = this.config.stopwatch.deltaTimeSinceLastTick;

    for (const system of this.systems) {
      system.run(this.entities, deltaTime);
    }

    return this;
  }
}
