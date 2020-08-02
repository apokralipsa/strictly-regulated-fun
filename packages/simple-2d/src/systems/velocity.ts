import { simple2dComponents } from '../components';
import { System } from '@strictly-regulated-fun/ecs';
import { multiplied } from '../..';

const { position, velocity } = simple2dComponents;

export const velocitySystem: System = {
  name: "Velocity system",
  run(entities, deltaTime): void {
    for (const [_, state] of entities.thatHave({ position, velocity })) {
      const positionDelta = multiplied(state.velocity, deltaTime / 1000);
      state.position.x += positionDelta.dx;
      state.position.y += positionDelta.dy;
    }
  },
};
