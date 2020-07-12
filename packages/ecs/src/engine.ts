import { DoRuntimeTypeChecks, Entity, RuntimeTypeCheck } from './entity';
import { Component } from './component';
import { System } from './system';

export interface Engine {
  createEntity(): Entity;
  defineSystem<T>(system: System<T>): Engine;
  tick(): void;
  remove(entity: Entity): void;
}

export interface EngineConfig {
  typeChecks: RuntimeTypeCheck;
}

const defaultEngineConfig: EngineConfig = {
  typeChecks: DoRuntimeTypeChecks,
};

export function createEngine(config: Partial<EngineConfig> = {}): Engine {
  return new NaiveEngine({ ...defaultEngineConfig, ...config });
}

class NaiveEngine implements Engine {
  private systems: System<any>[] = [];
  private entities: Set<Entity> = new Set();
  private lastTickTime = this.tickTime();

  constructor(private config: EngineConfig) {}

  createEntity(): Entity {
    const entity = new Entity(this.config.typeChecks);
    this.entities.add(entity);
    return entity;
  }

  remove(entity: Entity): void {
    this.entities.delete(entity);
  }

  tick(): void {
    const newTickTime = this.tickTime();
    const deltaTime = newTickTime - this.lastTickTime;
    this.lastTickTime = newTickTime;

    this.systems.forEach((system) => {
      const query = system.query;
      const queryParts = Object.entries<Component<any>>(query).filter(
        ([field, _]) => field !== "typeGuard"
      );

      const queryMatchedBy: (entity: Entity) => boolean =
        queryParts.length === 0
          ? (entity) => entity.has(query)
          : (entity) => queryParts.every((part) => entity.has(part[1]));

      const queriedDataOf: (entity: Entity) => any =
        queryParts.length === 0
          ? (entity) => entity.get(query)
          : (entity) =>
              Object.assign(
                {},
                ...queryParts.map(([componentName, component]) => ({
                  [componentName]: entity.get(component),
                }))
              );

      this.entities.forEach((entity) => {
        if (queryMatchedBy(entity)) {
          system.run(entity, queriedDataOf(entity), deltaTime);
        }
      });
    });
  }

  defineSystem<T>(system: System<T>): Engine {
    if (!system?.query) {
      throw new Error(
        "Could not define the system because its query is undefined. Are the components you are trying to use defined before the system?"
      );
    }

    this.systems = [...this.systems, system];
    return this;
  }

  private tickTime() {
    return new Date().getTime();
  }
}
