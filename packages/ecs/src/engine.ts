import { DoRuntimeTypeChecks, Entity, RuntimeTypeCheck } from "./entity";
import { System } from "./system";

export interface Engine {
  createEntity(): Entity;
  defineSystem<T>(system: System<T>): Engine;
  tick(): void;
}

export interface EngineConfig {
  typeChecks: RuntimeTypeCheck;
}

const defaultEngineConfig: EngineConfig = {
  typeChecks: DoRuntimeTypeChecks,
};

export function createEngine(config: Partial<EngineConfig> = {}): Engine {
  return new NaiveEngine({ ...config, ...defaultEngineConfig });
}

class NaiveEngine implements Engine {
  private systems: System<any>[] = [];
  private entities: Entity[] = [];
  private lastTickTime = this.tickTime();

  constructor(private config: EngineConfig) {}

  createEntity(): Entity {
    const entity = new Entity(this.config.typeChecks);
    this.entities = [...this.entities, entity];
    return entity;
  }

  tick(): void {
    const newTickTime = this.tickTime();
    const deltaTime = newTickTime - this.lastTickTime;
    this.lastTickTime = newTickTime;

    this.systems.forEach((system) => {
      const component = system.query;
      this.entities.forEach((entity) => {
        if (entity.has(component)) {
          system.run(entity, entity.get(component), deltaTime);
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
