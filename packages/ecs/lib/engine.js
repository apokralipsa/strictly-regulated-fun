"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEngine = void 0;
const entity_1 = require("./entity");
const defaultEngineConfig = {
    typeChecks: entity_1.DoRuntimeTypeChecks,
};
function createEngine(config = {}) {
    return new NaiveEngine(Object.assign(Object.assign({}, defaultEngineConfig), config));
}
exports.createEngine = createEngine;
class NaiveEngine {
    constructor(config) {
        this.config = config;
        this.systems = [];
        this.entities = [];
        this.lastTickTime = this.tickTime();
    }
    createEntity() {
        const entity = new entity_1.Entity(this.config.typeChecks);
        this.entities = [...this.entities, entity];
        return entity;
    }
    tick() {
        const newTickTime = this.tickTime();
        const deltaTime = newTickTime - this.lastTickTime;
        this.lastTickTime = newTickTime;
        this.systems.forEach((system) => {
            const query = system.query;
            const queryParts = Object.entries(query).filter(([field, _]) => field !== "typeGuard");
            const queryMatchedBy = queryParts.length === 0
                ? (entity) => entity.has(query)
                : (entity) => queryParts.every((part) => entity.has(part[1]));
            const queriedDataOf = queryParts.length === 0
                ? (entity) => entity.get(query)
                : (entity) => Object.assign({}, ...queryParts.map(([componentName, component]) => ({
                    [componentName]: entity.get(component),
                })));
            this.entities.forEach((entity) => {
                if (queryMatchedBy(entity)) {
                    system.run(entity, queriedDataOf(entity), deltaTime);
                }
            });
        });
    }
    defineSystem(system) {
        if (!(system === null || system === void 0 ? void 0 : system.query)) {
            throw new Error("Could not define the system because its query is undefined. Are the components you are trying to use defined before the system?");
        }
        this.systems = [...this.systems, system];
        return this;
    }
    tickTime() {
        return new Date().getTime();
    }
}
//# sourceMappingURL=engine.js.map