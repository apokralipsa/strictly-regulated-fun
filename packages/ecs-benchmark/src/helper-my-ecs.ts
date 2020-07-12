import { createEngine, Engine } from "ecs/lib/engine";
import { defineComponent, defineFlag } from "ecs/lib/component";

let engine: Engine;

interface Vector2D {
  x: number;
  y: number;
}

const position = defineComponent<Vector2D>();
const velocity = defineComponent<Vector2D>();
const render = defineFlag();
const history = defineComponent<string>();

let updates = { num: 0 };

export const my_ecs = {
  count: updates,
  name: "my-ecs",
  setup: () => {
    engine = createEngine();

    engine.defineSystem({
      name: "position system",
      query: position,
      run: () => {},
    });

    engine.defineSystem({
      name: "velocity system",
      query: { position, velocity },
      run: (entity, data) => {
        entity.set(position, {
          x: data.position.x + data.velocity.x,
          y: data.position.y + data.velocity.y,
        });

        updates.num++;
      },
    });

    engine.defineSystem({
      name: "render system",
      query: { position, velocity, render },
      run: () => {},
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
