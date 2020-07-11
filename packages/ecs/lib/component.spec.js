"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPosition = void 0;
const component_1 = require("./component");
function isPosition(input) {
    return typeof input.x === "number" && typeof input.y === "number";
}
exports.isPosition = isPosition;
describe("Component", () => {
    it("should be defined and specify the type of data it holds", () => {
        const position = component_1.defineComponent();
        expect(position).toBeDefined();
    });
    it("should allow to provide runtime type checking mechanims", () => {
        const position = component_1.defineComponent({ typeGuard: isPosition });
        expect(position.typeGuard).toBe(isPosition);
    });
    it('should allow to create "flag" components with no data', () => {
        const flag = component_1.defineFlag();
        expect(flag).toBeDefined();
    });
});
//# sourceMappingURL=component.spec.js.map