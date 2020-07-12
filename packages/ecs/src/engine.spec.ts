import { createEngine, Engine } from "./engine";
import { Entity, SkipRuntimeTypeChecks } from "./entity";
import { Component, defineComponent, defineFlag } from "./component";
import { isPosition, Position } from "./component.spec";
import * as FakeTimers from "@sinonjs/fake-timers";
import { StatefulSystem, System } from "./system";

describe("Engine", () => {
  let engine: Engine = createEngine();
  let position: Component<Position>;

  beforeEach(() => {
    engine = createEngine();
    position = defineComponent({ id: "position", typeGuard: isPosition });
  });

  it("should be created", () => {
    expect(engine).toBeDefined();
  });

  it("should create entities", () => {
    expect(engine.createEntity()).toBeDefined();
  });

  it("should not allow to define a system with undefined query", () => {
    const incorrectSystem = ({
      name: "incorrect system",
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

  let matchingEntity: Entity;
  let differentEntity: Entity;

  let receivedEntities: Entity[];
  let receivedData: Readonly<Position>[];
  let receivedDeltaTime: number;

  position = defineComponent<Position>({
    id: "position",
    typeGuard: isPosition,
  });

  engine = createEngine();

  engine.defineSystem({
    name: "position system",
    query: position,
    tick: (deltaTime) => {
      receivedDeltaTime = deltaTime;
    },
    run: (anEntity, data) => {
      receivedEntities = [...receivedEntities, anEntity];
      receivedData = [...receivedData, data];
    },
  });

  beforeAll(() => {
    clock = FakeTimers.install();

    afterAll(() => {
      clock.uninstall();
    });

    matchingEntity = engine.createEntity().set(position, { x: 1, y: 1 });
    differentEntity = engine.createEntity();
  });

  beforeEach(() => {
    receivedEntities = [];
    receivedData = [];
    engine.tick();
  });

  it("should receive the correct entities and data", () => {
    expect(receivedEntities).toEqual([matchingEntity]);
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
      expect(receivedEntities).toEqual([matchingEntity, matchingEntity]);
    });

    it("should be informed that some time has passed", () => {
      expect(receivedDeltaTime).toBe(passedMillis);
    });
  });

  describe("when an entity is removed", () => {
    let previouslyReceivedEntities: Entity[];
    beforeEach(() => {
      previouslyReceivedEntities = [...receivedEntities];
      engine.remove(matchingEntity);
      engine.tick();
    });

    it("should no longer receive it", () => {
      expect(receivedEntities).toEqual(previouslyReceivedEntities);
    });
  });

  describe("when the component is removed from that entity", () => {
    let previouslyReceivedEntities: Entity[];

    beforeEach(() => {
      previouslyReceivedEntities = [...receivedEntities];
      matchingEntity.remove(position);
      engine.tick();
    });

    it("should no longer receive it", () => {
      expect(receivedEntities).toEqual(previouslyReceivedEntities);
    });
  });
});

describe("A system that acts on a combination of components", () => {
  const hp = defineComponent<number>({ id: "hp" });
  const fireDamage = defineComponent<number>({ id: "fireDamage" });
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
    name: "fire damage system",
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

describe("A system written as a class", () => {
  it("should not require en explicit name", () => {
    const hp = defineComponent<number>({ id: "hp" });

    class MySystem extends StatefulSystem<typeof hp> {
      query = hp;
      run(): void {}

      constructor() {
        super();
      }
    }

    createEngine().defineSystem(new MySystem());
  });
});

describe("Entity", () => {
  interface Vector2D {
    x: number;
    y: number;
  }

  function typeGuard(input: any): input is Vector2D {
    return input && typeof input.x === "number" && typeof input.y === "number";
  }

  let position = defineComponent<Vector2D>({ id: "position" });
  let velocity = defineComponent<Vector2D>({ id: "velocity" });
  let unknownComponent = defineComponent<unknown>({ id: "unknown" });
  let strictPosition = defineComponent<Vector2D>({
    id: "strict position",
    typeGuard,
  });
  let dirty = defineFlag({ id: "dirty" });
  const incorrectDataInJson = JSON.stringify({ foo: "bar" });

  let entity: Entity;

  beforeEach(() => {
    entity = createEngine().createEntity();
  });

  it("should inform what components it has", () => {
    entity.set(position, { x: 1, y: 1 });

    expect(entity.has(position)).toBe(true);
    expect(entity.has(unknownComponent)).toBe(false);
  });

  it("should return the components it has", () => {
    entity.set(position, { x: 1, y: 1 }).set(velocity, { x: 0, y: 0 });

    const returnedPosition: Readonly<Vector2D> = entity.get(position);
    const returnedVelocity: Readonly<Vector2D> = entity.get(velocity);

    expect(returnedPosition).toEqual({ x: 1, y: 1 });
    expect(returnedVelocity).toEqual({ x: 0, y: 0 });
  });

  it("should throw an error if a component is missing", () => {
    expect(() => entity.get(unknownComponent)).toThrow(
      "Entity does not contain the requested component"
    );
  });

  it("should run runtime checks for components that define them by default", () => {
    expect(() =>
      entity.set(position, JSON.parse(incorrectDataInJson))
    ).not.toThrow();

    expect(() =>
      entity.set(strictPosition, JSON.parse(incorrectDataInJson))
    ).toThrow(
      `Could not set component because the data did not pass runtime type check: ${incorrectDataInJson}`
    );
  });

  it("should allow to set a flag without passing any data", () => {
    entity.setFlag(dirty);

    expect(entity.has(dirty)).toBe(true);
    expect(() => entity.get(dirty)).not.toThrow();
  });
});

describe("An engine with multiple systems", () => {
  const history = defineComponent<string[]>({ id: "history" });
  const foo = defineFlag({ id: "foo" });
  const bar = defineFlag({ id: "bar" });
  const engine = createEngine();
  const entity = engine
    .createEntity()
    .setFlag(foo)
    .setFlag(bar)
    .set(history, []);

  engine.defineSystem({
    name: "first",
    query: { history, foo },
    run: (matchedEntity, data) => {
      matchedEntity.set(history, [...data.history, "first"]);
    },
  });

  engine.defineSystem({
    name: "second",
    query: { history, bar },
    run: (matchedEntity, data) => {
      matchedEntity.set(history, [...data.history, "second"]);
    },
  });

  engine.defineSystem({
    name: "third",
    query: history,
    run: (matchedEntity, previousHistory) => {
      matchedEntity.set(history, [...previousHistory, "third"]);
    },
  });

  beforeEach(() => {
    engine.tick();
  });

  it("should run the system in the order they were defined", () => {
    expect(entity.get(history)).toEqual(["first", "second", "third"]);
  });
});
