import { System } from '@strictly-regulated-fun/ecs';
import { simple2dComponents } from '../components';
import { multiplied } from '../..';

const { velocity, acceleration } = simple2dComponents;

export const accelerationSystem: System = {
  name: "Acceleration system",
  run(entities, deltaTime) {
    for (const [_, state] of entities.thatHave({ velocity, acceleration })) {
      const velocityDelta = multiplied(state.acceleration, deltaTime / 1000);

      state.velocity.dx += velocityDelta.dx;
      state.velocity.dy += velocityDelta.dy;
    }
  },
};
