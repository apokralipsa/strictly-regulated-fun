import { createEngine, Engine } from './engine';
import { Entity } from './entity';
import { dirty, fireDamage, hp, poisonDamage } from './component.spec.fixture';
import { StatefulSystem } from './system';
import { defineComponent, defineFlag } from './component';

describe("A system that acts on a component", () => {
  let engine: Engine;

  let matchingEntity: Entity;
  let differentEntity: Entity;

  let receivedEntities: Entity[];
  let receivedData: number[];

  beforeEach(() => {
    receivedEntities = [];
    receivedData = [];

    engine = createEngine();
    matchingEntity = engine.createEntity().set(hp, 42);
    differentEntity = engine.createEntity();

    engine.defineSystem({
      name: "hp system",
      run: (entities) => {
        for (const [entity, state] of entities.thatHave({ hp })) {
          receivedEntities = [...receivedEntities, entity];
          receivedData = [...receivedData, state.hp];
        }
      },
    });

    engine.tick();
  });

  it("should receive the correct entities and data", () => {
    expect(receivedEntities).toEqual([matchingEntity]);
    expect(receivedData).toEqual([42]);
  });

  describe("when next engine tick occurs ", () => {
    beforeEach(() => {
      engine.tick();
    });

    it("should receive the same entity again", () => {
      expect(receivedEntities).toEqual([matchingEntity, matchingEntity]);
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
      matchingEntity.remove(hp);
      engine.tick();
    });

    it("should no longer receive it", () => {
      expect(receivedEntities).toEqual(previouslyReceivedEntities);
    });
  });

  describe("when an additional component is added to the matching entity", () => {
    beforeEach(() => {
      matchingEntity.set(fireDamage, 5);
    });

    it("should not operate on duplicated entities", () => {
      engine.tick();
      expect(receivedEntities.length).toBe(2);
    });
  });
});

describe("A system that acts on a combination of components", () => {
  let engine: Engine;

  let burningEntity: Entity;

  let receivedEntities: Entity[];
  let receivedData: {
    hp: Readonly<number>;
    fireDamage: Readonly<number>;
  }[];

  beforeEach(() => {
    engine = createEngine();

    engine.createEntity();
    engine.createEntity().set(hp, 35);
    burningEntity = engine
      .createEntity()
      .set(hp, 35)
      .set(fireDamage, 40)
      .set(poisonDamage, 5);

    engine.defineSystem({
      name: "fire damage system",
      run: (entities) => {
        for (const [entity, state] of entities.thatHave({ hp, fireDamage })) {
          receivedEntities = [...receivedEntities, entity];
          receivedData = [...receivedData, state];
        }
      },
    });

    receivedEntities = [];
    receivedData = [];
    engine.tick();
  });

  it("should only receive entities that match the whole query", () => {
    expect(receivedEntities).toEqual([burningEntity]);
  });

  it("should receive the data", () => {
    expect(receivedData[0]).toMatchObject({ hp: 35, fireDamage: 40 });
    expect(receivedData.length).toBe(1);
  });

  describe("when one of the required components is removed from entity", () => {
    beforeEach(() => {
      burningEntity.remove(fireDamage);
    });

    it("should no longer act on it", () => {
      const previouslyReceivedEntities = [...receivedEntities];
      engine.tick();
      expect(receivedEntities).toEqual(previouslyReceivedEntities);
    });
  });

  describe("when an unrelated component is removed", () => {
    beforeEach(() => {
      burningEntity.remove(poisonDamage);
    });

    it("should still act on it", () => {
      engine.tick();
      expect(receivedEntities.length).toBe(2);
    });
  });

  describe("when an additional component is added to the matching entity", () => {
    beforeEach(() => {
      burningEntity.setFlag(dirty);
    });

    it("should not operate on duplicated entities", () => {
      engine.tick();
      expect(receivedEntities.length).toBe(2);
    });
  });
});

describe("A system written as a class", () => {
  it("should not require en explicit name", () => {
    class MySystem extends StatefulSystem {
      run(): void {}
    }

    createEngine().defineSystem(new MySystem());
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
    run: (entities) => {
      for (const [_, state] of entities.thatHave({ history, foo })) {
        state.history = [...state.history, "first"];
      }
    },
  });

  engine.defineSystem({
    name: "second",
    run: (entities) => {
      for (const [_, state] of entities.thatHave({ history, bar })) {
        state.history = [...state.history, "second"];
      }
    },
  });

  engine.defineSystem({
    name: "third",
    run: (entities) => {
      for (const [_, state] of entities.thatHave({ history })) {
        state.history = [...state.history, "third"];
      }
    },
  });

  beforeEach(() => {
    engine.tick();
  });

  it("should run the system in the order they were defined", () => {
    expect(entity.get(history)).toEqual(["first", "second", "third"]);
  });
});
