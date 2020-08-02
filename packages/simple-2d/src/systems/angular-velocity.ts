import { System } from '@strictly-regulated-fun/ecs';
import { simple2dComponents } from '../components';

const { rotation, angularVelocity } = simple2dComponents;

export const angularVelocitySystem: System = {
  name: "Angular velocity system",
  run: (entities, delta) => {
    for (const [_, state] of entities.thatHave({ rotation, angularVelocity })) {
      state.rotation += (state.angularVelocity * delta) / 1000;
    }
  },
};
