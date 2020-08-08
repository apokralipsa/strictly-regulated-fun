import { simple2dComponents } from "../components";
import { System } from "@strictly-regulated-fun/ecs";
import { directionOf, lengthOf, vectorInDirection } from "../..";

const { velocity, maximumVelocity } = simple2dComponents;

export const maxVelocitySystem: System = {
  name: "Max velocity system",
  run(entities): void {
    for (const [_, state] of entities.thatHave({ velocity, maximumVelocity })) {
      if (lengthOf(state.velocity) > state.maximumVelocity) {
        const direction = directionOf(state.velocity);
        const newVelocity = vectorInDirection(direction, state.maximumVelocity);

        Object.assign(state.velocity, newVelocity);
      }
    }
  },
};
