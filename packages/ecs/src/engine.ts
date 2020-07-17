import { Entity } from './entity';
import { Query, System } from './system';
import { ViewBasedEngine } from './view-based-engine';
import { defaultStopwatch, Stopwatch } from './stopwatch';

export interface Engine {
  createEntity(): Entity;
  defineSystem<Q extends Query>(system: System<Q>): Engine;
  tick(): void;
  remove(entity: Entity): void;
}

export interface EngineConfig {
  typeChecks: boolean;
  stopwatch: Stopwatch;
}

const defaultEngineConfig: EngineConfig = {
  typeChecks: true,
  stopwatch: defaultStopwatch(),
};

export function createEngine(config: Partial<EngineConfig> = {}): Engine {
  return new ViewBasedEngine({ ...defaultEngineConfig, ...config });
}
