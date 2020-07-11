"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.my_ecs = void 0;
const engine_1 = require("ecs/lib/engine");
const component_1 = require("ecs/lib/component");
let engine;
const position = component_1.defineComponent();
const velocity = component_1.defineComponent();
const render = component_1.defineFlag();
const history = component_1.defineComponent();
let updates = { num: 0 };
exports.my_ecs = {
    count: updates,
    name: "my-ecs",
    setup: () => {
        engine = engine_1.createEngine();
        engine.defineSystem({
            query: position,
            run: () => { },
        });
        engine.defineSystem({
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
            query: { position, velocity, render },
            run: () => { },
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
    removeEntities: (entities) => {
    },
    removeVelocity: (entities) => {
    },
    addVelocity: (entity) => {
        entity.set(velocity, { x: 1, y: 1 });
    },
    update: () => {
        engine.tick();
    },
};
//# sourceMappingURL=helper-my-ecs.js.map