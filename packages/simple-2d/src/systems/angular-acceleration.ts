import { System } from "@strictly-regulated-fun/ecs";
import { simple2dComponents } from "../components";

const { angularAcceleration, angularVelocity } = simple2dComponents;

export const angularAccelerationSystem: System = {
  name: "Angular acceleration system",
  run: (entities, delta) => {
    for (const [_, state] of entities.thatHave({
      angularAcceleration,
      angularVelocity,
    })) {
      state.angularVelocity += (state.angularAcceleration * delta) / 1000;
    }
  },
};
