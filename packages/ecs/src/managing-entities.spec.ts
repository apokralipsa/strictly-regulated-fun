import { Entity } from "./entity";
import { createEngine } from "./engine";
import {
  dirty,
  fireDamage,
  hp,
  position,
  strictPosition,
  unknownComponent,
  Vector2D,
  velocity,
} from "./component.spec.fixture";
import { Component } from './component';

describe("Entity", () => {
  const incorrectDataInJson = JSON.stringify({ foo: "bar" });

  let entity: Entity;

  beforeEach(() => {
    entity = createEngine().createEntity();
  });

  it("should inform what components it has", () => {
    entity.set(hp, 42);

    expect(entity.has(hp)).toBe(true);
    expect(entity.has(fireDamage)).toBe(false);
  });

  it("should return the components it has", () => {
    entity.set(position, { x: 1, y: 1 }).set(velocity, { x: 0, y: 0 });

    const returnedPosition: Vector2D = entity.get(position);
    const returnedVelocity: Vector2D = entity.get(velocity);

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

  it('should throw a meaningful error when passed an invalid component', () => {
    const invalidComponent = {} as Component<any>;

    expect(() => entity.set(invalidComponent, 'foobar')).toThrow(/.*define./);
  });
});
