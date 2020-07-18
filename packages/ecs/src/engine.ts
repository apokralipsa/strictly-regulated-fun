import { Entity } from "./entity";
import { System } from "./system";
import { ViewBasedEngine } from "./view-based-engine";
import { defaultStopwatch, Stopwatch } from "./stopwatch";

export interface Engine {
  createEntity(): Entity;
  defineSystem(system: System): Engine;
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
