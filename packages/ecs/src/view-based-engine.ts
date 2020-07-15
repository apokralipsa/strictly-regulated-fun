import { Engine, EngineConfig } from "./engine";
import { Entity, RuntimeTypeCheck } from "./entity";
import { CombinationOfComponents, Query, System } from "./system";
import { Component, Flag, isComponent } from "./component";

interface View {
  handles(query: Query<any>): boolean;
  forEach(act: (entity: Entity, data: any) => void): void;
  test(entity: IndexedEntity): void;
  retest(entity: IndexedEntity): void;
  remove(entity: IndexedEntity): void;
}

interface SystemWithView {
  system: System<any>;
  view: View;
}

interface IndexedData {
  [componentId: string]: any;
}

const flagMarker = {};

class IndexedEntity implements Entity {
  data: IndexedData = {};
  containingViews = new Set<View>();

  constructor(
    private engine: ViewBasedEngine,
    private typeCheck: RuntimeTypeCheck
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
    this.typeCheck(component, data);

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
  private entities: IndexedEntity[] = [];

  viewToMatch(query: Query<any>): View {
    return this.existingViewToHandle(query) || this.newViewToHandle(query);
  }

  add(entity: IndexedEntity) {
    this.entities.push(entity);
  }

  remove(entity: IndexedEntity) {
    this.entities.splice(this.entities.indexOf(entity), 1);

    for (const view of entity.containingViews) {
      view.remove(entity);
    }
  }

  private existingViewToHandle(query: Query<any>): View | undefined {
    return this.views.find((view) => view.handles(query));
  }

  private newViewToHandle(query: Query<any>): View {
    const newView = this.constructViewFor(query);

    for (const entity of this.entities) {
      newView.test(entity);
    }

    this.views.push(newView);
    return newView;
  }

  private constructViewFor(query: Query<any>): View {
    if (isComponent(query)) {
      return new SingleComponentView(query);
    } else if (this.noMappingIsRequiredFor(query)) {
      return new SimpleMultiComponentView(query);
    } else {
      return new MappingMultiComponentView(query);
    }
  }

  private noMappingIsRequiredFor(query: CombinationOfComponents) {
    return Object.entries(query).every(
      ([requestedName, component]) => requestedName === component.componentId
    );
  }

  componentAddedTo(entity: IndexedEntity) {
    for (const view of this.views) {
      view.test(entity);
    }
  }
}

class SingleComponentView implements View {
  private matchedEntities= new Set<IndexedEntity>();
  constructor(private component: Component<any>) {}

  handles(query: Query<any>): boolean {
    return this.component === query;
  }

  forEach(act: (entity: Entity, data: any) => void): void {
    for (const entity of this.matchedEntities) {
      act(entity, entity.data[this.component.componentId]);
    }
  }

  test(entity: IndexedEntity): void {
    if (entity.has(this.component)) {
      this.matchedEntities.add(entity);
      entity.containingViews.add(this);
    }
  }

  retest(entity: IndexedEntity): void {
    if (!entity.has(this.component)) {
      this.remove(entity);
      entity.containingViews.delete(this);
    }
  }

  remove(entity: IndexedEntity): void {
    this.matchedEntities.delete(entity);
  }
}

class SimpleMultiComponentView implements View {
  private readonly matchedEntities = new Set<IndexedEntity>();
  private readonly componentNames: string[];

  constructor(private query: CombinationOfComponents) {
    this.componentNames = this.componentNamesIn(query);
  }

  handles(query: Query<any>): boolean {
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

  test(entity: IndexedEntity): void {
    if (this.queryIsMatchedBy(entity)) {
      this.matchedEntities.add(entity);
      entity.containingViews.add(this);
    }
  }

  retest(entity: IndexedEntity): void {
    if (!this.queryIsMatchedBy(entity)) {
      this.remove(entity);
      entity.containingViews.delete(this);
    }
  }

  remove(entity: IndexedEntity): void {
    this.matchedEntities.delete(entity);
  }

  private queryIsMatchedBy(entity: IndexedEntity) {
    return this.componentNames.every((componentName) =>
      entity.data.hasOwnProperty(componentName)
    );
  }

  private componentNamesIn(query: Query<any>) {
    return Object.keys(query);
  }
}

type ComponentMapping = [string, string][];

class MappingMultiComponentView implements View {
  private readonly mapping: ComponentMapping;
  private readonly mappedData = new Map<IndexedEntity, any>();

  constructor(query: CombinationOfComponents) {
    this.mapping = this.mappingRequiredBy(query);
    console.warn(
      `Constructing a mapping view as the ids in a query do not match the field names. Required mapping: ${JSON.stringify(
        this.mapping
      )}. THIS WILL CAUSE A PERFORMANCE DEGRADATION. `
    );
  }

  handles(query: Query<any>): boolean {
    const requiredMapping = this.mappingRequiredBy(query);
    return (
      this.mapping.length === requiredMapping.length &&
      JSON.stringify(this.mapping) === JSON.stringify(requiredMapping)
    );
  }

  forEach(act: (entity: Entity, data: any) => void): void {
    Array.from(this.mappedData.entries()).forEach(([entity, data]) => {
      act(entity, data);
    });
  }

  test(entity: IndexedEntity): void {
    if (this.queryIsMatchedBy(entity)) {
      this.mappedData.set(entity, this.map(entity.data));
      entity.containingViews.add(this);
    }
  }

  retest(entity: IndexedEntity): void {
    if (!this.queryIsMatchedBy(entity)) {
      this.mappedData.delete(entity);
      entity.containingViews.delete(this);
    }
  }

  remove(entity: IndexedEntity): void {
    this.mappedData.delete(entity);
  }

  private mappingRequiredBy(query: Query<any>): [string, string][] {
    return Object.keys(query).map((key) => [
      key,
      query[key].componentId as string,
    ]);
  }
  private queryIsMatchedBy(entity: IndexedEntity) {
    return this.mapping.every(([_, componentId]) =>
      entity.data.hasOwnProperty(componentId)
    );
  }

  private map(data: IndexedData) {
    return Object.assign(
      {},
      ...this.mapping.map(([newKey, id]) => [newKey, data[id]])
    );
  }
}

class Clock {
  private lastTickTime = this.tickTime();

  measuredDelta() {
    const newTickTime = this.tickTime();
    const deltaTime = newTickTime - this.lastTickTime;
    this.lastTickTime = newTickTime;

    return deltaTime;
  }

  private tickTime() {
    return new Date().getTime();
  }
}

export class ViewBasedEngine implements Engine {
  private views = new Views();
  private systems: SystemWithView[] = [];
  private clock = new Clock();

  constructor(private config: EngineConfig) {}

  createEntity(): Entity {
    let newEntity = new IndexedEntity(this, this.config.typeChecks);
    this.views.add(newEntity);
    return newEntity;
  }

  defineSystem<Q extends Query<any>>(system: System<Q>): Engine {
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
    this.views.remove(entity as IndexedEntity);
  }

  tick(): void {
    const deltaTime = this.clock.measuredDelta();

    for (const { system, view } of this.systems) {
      if (system.tick) {
        system.tick(deltaTime);
      }

      view.forEach((entity, data) => {
        system.run(entity, data);
      });
    }
  }

  componentAdded(entity: IndexedEntity) {
    this.views.componentAddedTo(entity);
  }
}
