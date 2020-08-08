import { fireDamage, hp, poisonDamage, dirty } from "./component.spec.fixture";
import { createEngine, Engine } from "./engine";

describe("Modifying multiple components", () => {
  let engine: Engine;
  let matchedEntities: any[];

  beforeEach(() => {
    engine = createEngine();
    matchedEntities = [];

    engine.defineSystem({
      name: "a system",
      run: (entities) => {
        for (const [_, state] of entities.thatHave({ hp })) {
          matchedEntities.push(state);
        }
      },
    });
  });

  it("should not apply any changes eagerly", () => {
    // given
    engine
      .createEntity()
      .modify()
      .set(hp, 42)
      .set(fireDamage, 5)
      .set(poisonDamage, 2);

    // when
    engine.tick();

    // then
    expect(matchedEntities).toEqual([]);
  });

  it("should apply changes when called", () => {
    // given
    engine
      .createEntity()
      .modify()
      .set(hp, 42)
      .set(fireDamage, 5)
      .set(poisonDamage, 2)
      .applyChanges();

    // when
    engine.tick();

    // then
    expect(matchedEntities).toEqual([
      {
        hp: 42,
        fireDamage: 5,
        poisonDamage: 2,
      },
    ]);
  });

  it("should allow to remove components", () => {
    engine
      .createEntity()
      .set(hp, 42)
      .set(fireDamage, 5)
      .set(poisonDamage, 2)
      .set(dirty, true)
      .modify()
      .remove(fireDamage)
      .remove(poisonDamage)
      .remove(dirty)
      .applyChanges();

    // when
    engine.tick();

    // then
    expect(matchedEntities).toEqual([{ hp: 42 }]);
  });

  it("should make entities no longer match a query", () => {
    // given
    const entity = engine.createEntity().set(hp, 42);
    engine.tick();
    matchedEntities.length = 0;

    // and
    entity.modify().remove(hp).applyChanges();

    // when
    engine.tick();

    // then
    expect(matchedEntities).toEqual([]);
  });

  it("should take into account the order of operations same way as doing atomic changes does", () => {
    // given
    engine
      .createEntity()
      .set(hp, 30)
      .set(fireDamage, 5)

      .modify()
      .remove(hp)
      .set(hp, 42)
      .set(fireDamage, 9)
      .remove(fireDamage)
      .applyChanges();

    // when
    engine.tick();

    //then
    expect(matchedEntities).toEqual([{ hp: 42 }]);
  });
});
