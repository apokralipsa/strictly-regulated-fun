import { Entity } from "./entity";
import { System } from "./system";
import { ViewBasedEngine } from "./view-based-engine";
import { defaultStopwatch, Stopwatch } from "./stopwatch";

export interface Engine {
  createEntity(): Entity;
  defineSystem(system: System): Engine;
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
