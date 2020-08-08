import { simple2dComponents } from '../components';
import { createEngine, Engine, Stopwatch } from '@strictly-regulated-fun/ecs';
import { maxVelocitySystem } from './max-velocity';
import { directionOf, lengthOf } from '../..';

describe("Max velocity system", () => {
  const { velocity, maximumVelocity } = simple2dComponents;

  let engine: Engine;
  let stopwatch: Stopwatch = {
    deltaTimeSinceLastTick: 10, // 100 FPS for simple calculations
  };

  beforeEach(() => {
    engine = createEngine({ stopwatch });
    engine.defineSystem(maxVelocitySystem);
  });

  it("should not affect entities that are not moving at top speed", () => {
    [
      {
        currentVelocity: { dx: 10, dy: 0 },
        topSpeed: 10,
      },
      {
        currentVelocity: { dx: 0, dy: 10 },
        topSpeed: 10,
      },
      {
        currentVelocity: { dx: 5, dy: 5 },
        topSpeed: 25,
      },
    ].forEach(({ currentVelocity, topSpeed }) => {

      //given
      const entity = engine
        .createEntity()
        .set(velocity, currentVelocity)
        .set(maximumVelocity, topSpeed);

      //when
      engine.tick();

      //then
      expect(entity.get(velocity)).toEqual(currentVelocity);
    });
  });

  it("should cut the velocity to max speed, but keep the same direction", () => {
    [
      {
        currentVelocity: { dx: 10, dy: 0 },
        topSpeed: 1,
      },
      {
        currentVelocity: { dx: 0, dy: 10 },
        topSpeed: 9.999,
      },
      {
        currentVelocity: { dx: 5, dy: 5 },
        topSpeed: 5,
      },
    ].forEach(({ currentVelocity: oldVelocity, topSpeed }) => {

      //given
      const entity = engine
        .createEntity()
        .set(velocity, oldVelocity)
        .set(maximumVelocity, topSpeed);

      //when
      engine.tick();

      //then
      const newVelocity = entity.get(velocity);
      expect(directionOf(newVelocity)).toEqual(directionOf(oldVelocity));
      expect(lengthOf(newVelocity)).toEqual(topSpeed);
    });
  });
});
