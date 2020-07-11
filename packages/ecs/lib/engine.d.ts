import { Entity, RuntimeTypeCheck } from "./entity";
import { System } from "./system";
export interface Engine {
    createEntity(): Entity;
    defineSystem<T>(system: System<T>): Engine;
    tick(): void;
}
export interface EngineConfig {
    typeChecks: RuntimeTypeCheck;
}
export declare function createEngine(config?: Partial<EngineConfig>): Engine;
