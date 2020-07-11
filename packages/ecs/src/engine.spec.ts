import { createEngine, Engine } from "./engine";
import { Entity, SkipRuntimeTypeChecks } from "./entity";
import { Component, defineComponent } from "./component";
import { isPosition, Position } from "./component.spec";
import * as FakeTimers from "@sinonjs/fake-timers";
import { System } from "./system";

describe("Engine", () => {
  let engine: Engine = createEngine();
  let position: Component<Position>;

  beforeEach(() => {
    engine = createEngine();
    position = defineComponent({ typeGuard: isPosition });
  });

  it("should be created", () => {
    expect(engine).toBeDefined();
  });

  it("should create entities", () => {
    expect(engine.createEntity()).toBeDefined();
  });

  it("should not allow to define a system with undefined query", () => {
    const incorrectSystem = ({
      query: undefined,
      run: () => {},
    } as unknown) as System<any>;

    expect(() => engine.defineSystem(incorrectSystem)).toThrow(
      "Could not define the system because its query is undefined. Are the components you are trying to use defined before the system?"
    );
  });

  it("should run runtime type checks by default", () => {
    expect(() =>
      engine.createEntity().set(position, ({ foo: "bar" } as any) as Position)
    ).toThrow();
  });

  it("should give an option to disable runtime type checks", () => {
    expect(() =>
      createEngine({ typeChecks: SkipRuntimeTypeChecks })
        .createEntity()
        .set(position, ({ foo: "bar" } as any) as Position)
    ).not.toThrow();
  });
});

describe("A system that acts on a component", () => {
  let clock: FakeTimers.InstalledClock;

  let engine: Engine;
  let position: Component<Position>;

  let expectedEntity: Entity;
  let differentEntity: Entity;

  let receivedEntities: Entity[];
  let receivedData: Readonly<Position>[];
  let receivedDeltaTime: number;

  position = defineComponent<Position>({ typeGuard: isPosition });

  engine = createEngine();

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
  const hp = defineComponent<number>();
  const fireDamage = defineComponent<number>();
  const engine = createEngine();

  let receivedEntities: Entity[] = [];
  let receivedData: {
    hp: Readonly<number>;
    fireDamage: Readonly<number>;
  }[] = [];

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
