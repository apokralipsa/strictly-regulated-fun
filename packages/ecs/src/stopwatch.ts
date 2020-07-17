export interface Stopwatch {
  readonly deltaTimeSinceLastTick: number;
}

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
