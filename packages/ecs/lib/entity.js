"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = exports.DoRuntimeTypeChecks = exports.SkipRuntimeTypeChecks = void 0;
exports.SkipRuntimeTypeChecks = () => { };
exports.DoRuntimeTypeChecks = (component, input) => {
    if (component.typeGuard && !component.typeGuard(input)) {
        const json = JSON.stringify(input);
        throw new Error(`Could not set component because the data did not pass runtime type check: ${json}`);
    }
};
class Entity {
    constructor(checkType = exports.DoRuntimeTypeChecks) {
        this.checkType = checkType;
        this.components = new Map();
    }
    set(component, data) {
        this.checkType(component, data);
        this.components.set(component, data);
        return this;
    }
    setFlag(flag) {
        this.components.set(flag, null);
        return this;
    }
    get(component) {
        if (!this.components.has(component)) {
            throw new Error(`Entity does not contain the requested component`);
        }
        let data = this.components.get(component);
        return data;
    }
    has(component) {
        return this.components.has(component);
    }
}
exports.Entity = Entity;
//# sourceMappingURL=entity.js.map