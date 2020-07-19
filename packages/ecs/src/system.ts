import { Entities } from "./entities";

/**
 * A piece of logic that is to be run once each engine tick.
 */
export interface System {
  readonly name: string;
  /**
   * Implements the logic that is to be run by a system.
   *
   * @param entities Represents all entities in the engine running this system
   * @param deltaTime The amount of time that passed since the last time this system was run.
   * Depends on the used stopwatch. By default uses milliseconds.
   */
  run: (entities: Entities, deltaTime: number) => void;
}

export abstract class StatefulSystem implements System {
  readonly name;

  constructor() {
    this.name = this.constructor.name;
  }

  abstract run(entities: Entities, deltaTime: number): void;
}
