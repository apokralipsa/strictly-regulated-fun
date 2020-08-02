import { simple2dComponents } from "../components";
import { velocitySystem } from './velocity';
import { createEngine, Engine, Stopwatch } from '@strictly-regulated-fun/ecs';

describe("Velocity system", () => {
  const { position, velocity } = simple2dComponents;

  let engine: Engine;
  let stopwatch: Stopwatch = {
    deltaTimeSinceLastTick: 10, // 100 FPS for simple calculations
  };

  beforeEach(() => {
    engine = createEngine({ stopwatch });
    engine.defineSystem(velocitySystem);
  });

  it("should move entities", () => {
    //given
    const entity = engine
      .createEntity()
      .set(position, { x: 1, y: 1 })
      .set(velocity, { dx: 50, dy: 100 });

    //when
    engine.tick();

    //then
    const resultantPosition = entity.get(position);
    expect(resultantPosition.x).toEqual(1.5);
    expect(resultantPosition.y).toEqual(2);
  });
});
