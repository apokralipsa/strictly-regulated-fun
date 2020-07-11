"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineFlag = exports.defineComponent = void 0;
function defineComponent(options = {}) {
    return { typeGuard: options === null || options === void 0 ? void 0 : options.typeGuard };
}
exports.defineComponent = defineComponent;
function defineFlag() {
    return {};
}
exports.defineFlag = defineFlag;
//# sourceMappingURL=component.js.map