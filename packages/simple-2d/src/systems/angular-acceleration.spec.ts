import { simple2dComponents } from '../components';
import { createEngine, Engine, Stopwatch } from '@strictly-regulated-fun/ecs';
import { angularAccelerationSystem } from './angular-acceleration';

describe("Angular acceleration system", () => {
  const { angularVelocity, angularAcceleration } = simple2dComponents;

  let engine: Engine;
  let stopwatch: Stopwatch = {
    deltaTimeSinceLastTick: 10, // 100 FPS for simple calculations
  };

  beforeEach(() => {
    engine = createEngine({ stopwatch });
    engine.defineSystem(angularAccelerationSystem);
  });

  it("should move entities", () => {
    //given
    const entity = engine
      .createEntity()
      .set(angularVelocity, 1)
      .set(angularAcceleration, 1);

    //when
    engine.tick();

    //then
    const resultantAngularVelocity = entity.get(angularVelocity);
    expect(resultantAngularVelocity).toEqual(1.01);
  });
});
