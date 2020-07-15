import { DoRuntimeTypeChecks, Entity, RuntimeTypeCheck } from './entity';
import { Query, System } from './system';
import { NaiveEngine } from './naive-engine';
import { ViewBasedEngine } from './view-based-engine';

export interface Engine {
  createEntity(): Entity;
  defineSystem<Q extends Query<any>>(system: System<Q>): Engine;
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
  return new ViewBasedEngine({...defaultEngineConfig, ...config});
}

