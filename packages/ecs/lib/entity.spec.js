"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = require("./component");
const entity_1 = require("./entity");
function typeGuard(input) {
    return input && typeof input.x === "number" && typeof input.y === "number";
}
describe("Entity", () => {
    let position = component_1.defineComponent();
    let velocity = component_1.defineComponent();
    let unknownComponent = component_1.defineComponent();
    let strictPosition = component_1.defineComponent({ typeGuard });
    let dirty = component_1.defineFlag();
    const incorrectDataInJson = JSON.stringify({ foo: "bar" });
    let entity;
    beforeEach(() => {
        entity = new entity_1.Entity();
    });
    it("should inform what components it has", () => {
        entity.set(position, { x: 1, y: 1 });
        expect(entity.has(position)).toBe(true);
        expect(entity.has(unknownComponent)).toBe(false);
    });
    it("should return the components it has", () => {
        entity.set(position, { x: 1, y: 1 }).set(velocity, { x: 0, y: 0 });
        const returnedPosition = entity.get(position);
        const returnedVelocity = entity.get(velocity);
        expect(returnedPosition).toEqual({ x: 1, y: 1 });
        expect(returnedVelocity).toEqual({ x: 0, y: 0 });
    });
    it("should throw an error if a component is missing", () => {
        expect(() => entity.get(unknownComponent)).toThrow("Entity does not contain the requested component");
    });
    it("should run runtime checks for components that define them by default", () => {
        expect(() => entity.set(position, JSON.parse(incorrectDataInJson))).not.toThrow();
        expect(() => entity.set(strictPosition, JSON.parse(incorrectDataInJson))).toThrow(`Could not set component because the data did not pass runtime type check: ${incorrectDataInJson}`);
    });
    it("should allow to skip runtime checks", () => {
        expect(() => new entity_1.Entity(entity_1.SkipRuntimeTypeChecks).set(position, JSON.parse(incorrectDataInJson))).not.toThrow();
    });
    it("should allow to set a flag without passing any data", () => {
        entity.setFlag(dirty);
        expect(entity.has(dirty)).toBe(true);
        expect(() => entity.get(dirty)).not.toThrow();
    });
});
//# sourceMappingURL=entity.spec.js.map