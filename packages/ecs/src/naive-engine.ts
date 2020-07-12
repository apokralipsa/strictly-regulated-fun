import { Query, System } from './system';
import { Component, Flag } from './component';
import { Engine, EngineConfig } from './engine';
import { DoRuntimeTypeChecks, Entity, RuntimeTypeCheck } from './entity';

export class NaiveEngine implements Engine {
  private systems: System<any>[] = [];
  private entities: Set<NaiveEntity> = new Set();
  private lastTickTime = this.tickTime();

  constructor(private config: EngineConfig) {
  }

  createEntity(): NaiveEntity {
    const entity = new NaiveEntity(this.config.typeChecks);
    this.entities.add(entity);
    return entity;
  }

  remove(entity: NaiveEntity): void {
    this.entities.delete(entity);
  }

  tick(): void {
    const newTickTime = this.tickTime();
    const deltaTime = newTickTime - this.lastTickTime;
    this.lastTickTime = newTickTime;

    this.systems.forEach((system) => {
      if(system.tick) {
        system.tick(deltaTime);
      }

      const query = system.query;
      const queryParts = Object.entries<Component<any>>(query).filter(
        ([field, _]) => field !== 'typeGuard'
      );

      const queryMatchedBy: (entity: NaiveEntity) => boolean =
        queryParts.length === 0
          ? (entity) => entity.has(query)
          : (entity) => queryParts.every((part) => entity.has(part[1]));

      const queriedDataOf: (entity: NaiveEntity) => any =
        queryParts.length === 0
          ? (entity) => entity.get(query)
          : (entity) =>
            Object.assign(
              {},
              ...queryParts.map(([componentName, component]) => ({
                [componentName]: entity.get(component)
              }))
            );

      this.entities.forEach((entity) => {
        if (queryMatchedBy(entity)) {
          system.run(entity, queriedDataOf(entity));
        }
      });
    });
  }

  defineSystem<Q extends Query<any>>(system: System<Q>): Engine {
    if (!system?.query) {
      throw new Error(
        'Could not define the system because its query is undefined. Are the components you are trying to use defined before the system?'
      );
    }

    this.systems = [...this.systems, system];
    return this;
  }

  private tickTime() {
    return new Date().getTime();
  }
}

class NaiveEntity implements Entity {
  private readonly components: Map<Component<any>, any> = new Map();

  constructor(private checkType: RuntimeTypeCheck = DoRuntimeTypeChecks) {
  }

  set<T>(component: Component<T>, data: T): Entity {
    this.checkType(component, data);
    this.components.set(component, data);
    return this;
  }

  setFlag(flag: Flag) {
    this.components.set(flag, null);
    return this;
  }

  get<T>(component: Component<T>): Readonly<T> {
    if (!this.components.has(component)) {
      throw new Error(`Entity does not contain the requested component`);
    }
    let data = this.components.get(component);
    return data as Readonly<T>;
  }

  has(component: Component<any>): boolean {
    return this.components.has(component);
  }

  remove(component: Component<any>) {
    this.components.delete(component);
    return this;
  }
}
