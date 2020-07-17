import { createEngine, Engine } from "ecs/lib/engine";
import { defineComponent, defineFlag } from "ecs/lib/component";

let engine: Engine;

interface Vector2D {
  x: number;
  y: number;
}

const position = defineComponent<Vector2D>({id: "position"});
const velocity = defineComponent<Vector2D>({id: "velocity"});
const render = defineFlag({id: "render"});
const history = defineComponent<string>({id: "history"});

let updates = { num: 0 };

export const my_ecs = {
  count: updates,
  name: "my-ecs",
  setup: () => {
    engine = createEngine();

    engine.defineSystem({
      name: "position system",
      run: (entities) => {
        for(const result of entities.findWith({position})){

        }
      },
    });

    engine.defineSystem({
      name: "velocity system",
      run: (entities) => {
        for(const [entity, state] of entities.findWith({position, velocity})){
          entity.set(position, {
            x: state.position.x + state.velocity.x,
            y: state.position.y + state.velocity.y,
          });
          updates.num++;
        }
      },
    });

    engine.defineSystem({
      name: "render system",
      run: (entities) => {
        for(const result of entities.findWith({ position, velocity, render })){

        }
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
