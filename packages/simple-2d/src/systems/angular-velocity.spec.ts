import { simple2dComponents } from "../components";
import { createEngine, Engine, Stopwatch } from "@strictly-regulated-fun/ecs";
import { angularVelocitySystem } from './angular-velocity';

describe("Angular velocity system", () => {
  const { angularVelocity, rotation } = simple2dComponents;

  let engine: Engine;
  let stopwatch: Stopwatch = {
    deltaTimeSinceLastTick: 10, // 100 FPS for simple calculations
  };

  beforeEach(() => {
    engine = createEngine({ stopwatch });
    engine.defineSystem(angularVelocitySystem);
  });

  it("should rotate entities", () => {
    //given
    const entity = engine
      .createEntity()
      .set(rotation, 1)
      .set(angularVelocity, 1);

    //when
    engine.tick();

    //then
    const resultantRotation = entity.get(rotation);
    expect(resultantRotation).toEqual(1.01);
  });
});
