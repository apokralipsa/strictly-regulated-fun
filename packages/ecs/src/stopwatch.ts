/**
 * Used once each engine tick to get the delta time since last tick.
 */
export interface Stopwatch {
  readonly deltaTimeSinceLastTick: number;
}

/**
 * @return a stopwatch that uses that measures system time in milliseconds
 */
export function defaultStopwatch() {
  return new SystemTimeInMillisStopwatch();
}

class SystemTimeInMillisStopwatch implements Stopwatch {
  private lastTickTime = this.tickTime();

  get deltaTimeSinceLastTick() {
    const newTickTime = this.tickTime();
    const deltaTime = newTickTime - this.lastTickTime;
    this.lastTickTime = newTickTime;

    return deltaTime;
  }

  private tickTime() {
    return new Date().getTime();
  }
}
