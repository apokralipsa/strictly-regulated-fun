import { simple2dComponents } from "../components";
import { createEngine, Engine, Stopwatch } from "@strictly-regulated-fun/ecs";
import { accelerationSystem } from './acceleration';

describe("Acceleration system", () => {
  const { acceleration, velocity } = simple2dComponents;

  let engine: Engine;
  let stopwatch: Stopwatch = {
    deltaTimeSinceLastTick: 10, // 100 FPS for simple calculations
  };

  beforeEach(() => {
    engine = createEngine({ stopwatch });
    engine.defineSystem(accelerationSystem);
  });

  it("should move entities", () => {
    //given
    const entity = engine
      .createEntity()
      .set(velocity, { dx: 0, dy: 0 })
      .set(acceleration, { dx: 1, dy: 2 });

    //when
    engine.tick();

    //then
    const resultantVelocity = entity.get(velocity);
    expect(resultantVelocity.dx).toEqual(0.01);
    expect(resultantVelocity.dy).toEqual(0.02);
  });
});
