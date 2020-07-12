import { DoRuntimeTypeChecks, Entity, RuntimeTypeCheck } from './entity';
import { System } from './system';
import { NaiveEngine } from './naive-engine';

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

