"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const engine_1 = require("./engine");
const entity_1 = require("./entity");
const component_1 = require("./component");
const component_spec_1 = require("./component.spec");
const FakeTimers = require("@sinonjs/fake-timers");
describe("Engine", () => {
    let engine = engine_1.createEngine();
    let position;
    beforeEach(() => {
        engine = engine_1.createEngine();
        position = component_1.defineComponent({ typeGuard: component_spec_1.isPosition });
    });
    it("should be created", () => {
        expect(engine).toBeDefined();
    });
    it("should create entities", () => {
        expect(engine.createEntity()).toBeDefined();
    });
    it("should not allow to define a system with undefined query", () => {
        const incorrectSystem = {
            query: undefined,
            run: () => { },
        };
        expect(() => engine.defineSystem(incorrectSystem)).toThrow("Could not define the system because its query is undefined. Are the components you are trying to use defined before the system?");
    });
    it("should run runtime type checks by default", () => {
        expect(() => engine.createEntity().set(position, { foo: "bar" })).toThrow();
    });
    it("should give an option to disable runtime type checks", () => {
        expect(() => engine_1.createEngine({ typeChecks: entity_1.SkipRuntimeTypeChecks })
            .createEntity()
            .set(position, { foo: "bar" })).not.toThrow();
    });
});
describe("A system that acts on a component", () => {
    let clock;
    let engine;
    let position;
    let expectedEntity;
    let differentEntity;
    let receivedEntities;
    let receivedData;
    let receivedDeltaTime;
    position = component_1.defineComponent({ typeGuard: component_spec_1.isPosition });
    engine = engine_1.createEngine();
    engine.defineSystem({
        query: position,
        run: (anEntity, data, deltaTime) => {
            receivedEntities = [...receivedEntities, anEntity];
            receivedData = [...receivedData, data];
            receivedDeltaTime = deltaTime;
        },
    });
    beforeAll(() => {
        clock = FakeTimers.install();
        afterAll(() => {
            clock.uninstall();
        });
        expectedEntity = engine.createEntity().set(position, { x: 1, y: 1 });
        differentEntity = engine.createEntity();
    });
    beforeEach(() => {
        receivedEntities = [];
        receivedData = [];
        engine.tick();
    });
    it("should receive the correct entities and data", () => {
        expect(receivedEntities).toEqual([expectedEntity]);
        expect(receivedData).toEqual([{ x: 1, y: 1 }]);
    });
    it("should be informed that no passage of time has happened yet", () => {
        expect(receivedDeltaTime).toBe(0);
    });
    describe("when next engine tick occurs after some time has passed", () => {
        const passedMillis = 20;
        beforeEach(() => {
            clock.tick(20);
            engine.tick();
        });
        it("should receive the same entity again", () => {
            expect(receivedEntities).toEqual([expectedEntity, expectedEntity]);
        });
        it("should be informed that some time has passed", () => {
            expect(receivedDeltaTime).toBe(passedMillis);
        });
    });
});
describe("A system that acts on a combination of components", () => {
    const hp = component_1.defineComponent();
    const fireDamage = component_1.defineComponent();
    const engine = engine_1.createEngine();
    let receivedEntities = [];
    let receivedData = [];
    engine.createEntity();
    engine.createEntity().set(hp, 35);
    const burningEntity = engine.createEntity().set(hp, 35).set(fireDamage, 40);
    engine.defineSystem({
        query: { hp, fireDamage },
        run: (entity, data) => {
            receivedEntities = [...receivedEntities, entity];
            receivedData = [...receivedData, data];
        },
    });
    beforeAll(() => {
        engine.tick();
    });
    it("should only receive entities that match the whole query", () => {
        expect(receivedEntities).toEqual([burningEntity]);
    });
    it("should receive the data", () => {
        expect(receivedData).toEqual([{ hp: 35, fireDamage: 40 }]);
    });
});
//# sourceMappingURL=engine.spec.js.map