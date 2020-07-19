import { createEngine, Engine } from "ecs/lib/engine";
import { As, define } from "ecs/lib/component";

let engine: Engine;

interface Vector2D {
  x: number;
  y: number;
}

const { position, velocity } = define({
  position: As.a<Vector2D>(),
  velocity: As.a<Vector2D>(),
});
const { render } = define({ render: As.aFlag() });
const { history } = define({ history: As.a<string>() });

let updates = { num: 0 };

export const my_ecs = {
  count: updates,
  name: "my-ecs",
  setup: () => {
    engine = createEngine();

    engine.defineSystem({
      name: "position system",
      run: (entities) => {
        entities.thatHave({ position });
      },
    });

    engine.defineSystem({
      name: "velocity system",
      run: (entities) => {
        for (const [_, state] of entities.thatHave({
          position,
          velocity,
        })) {
          state.position.x += state.velocity.x;
          state.position.y += state.velocity.y;
          updates.num++;
        }
      },
    });

    engine.defineSystem({
      name: "render system",
      run: (entities) => {
        entities.thatHave({
          position,
          velocity,
          render,
        });
      },
    });
  },

  createEntities: () => {
    const e1 = engine.createEntity().set(position, { x: 1, y: 1 });

    const e2 = engine
      .createEntity()
      .set(position, { x: 1, y: 1 })
      .set(velocity, { x: 1, y: 1 });

    const e3 = engine
      .createEntity()
      .set(position, { x: 1, y: 1 })
      .set(velocity, { x: 1, y: 1 })
      .setFlag(render);

    const e4 = engine
      .createEntity()
      .set(position, { x: 1, y: 1 })
      .set(velocity, { x: 1, y: 1 })
      .setFlag(render)
      .set(history, "some history");

    return [e1, e2, e3, e4];
  },
  removeEntities: (entities: any[]) => {
    for (const entity of entities) {
      engine.remove(entity);
    }
  },
  removeVelocity: (entities: any[]) => {
    for (const entity of entities) {
      entity.remove(velocity);
    }
  },
  addVelocity: (entity) => {
    entity.set(velocity, { x: 1, y: 1 });
  },
  update: () => {
    engine.tick();
  },
};
