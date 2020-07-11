import { defineComponent, defineFlag } from "./component";
import { Entity, SkipRuntimeTypeChecks } from "./entity";

interface Vector2D {
  x: number;
  y: number;
}

function typeGuard(input: any): input is Vector2D {
  return input && typeof input.x === "number" && typeof input.y === "number";
}

describe("Entity", () => {
  let position = defineComponent<Vector2D>();
  let velocity = defineComponent<Vector2D>();
  let unknownComponent = defineComponent<unknown>();
  let strictPosition = defineComponent<Vector2D>({ typeGuard });
  let dirty = defineFlag();
  const incorrectDataInJson = JSON.stringify({ foo: "bar" });

  let entity: Entity;

  beforeEach(() => {
    entity = new Entity();
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

  it("should allow to skip runtime checks", () => {
    expect(() =>
      new Entity(SkipRuntimeTypeChecks).set(
        position,
        JSON.parse(incorrectDataInJson)
      )
    ).not.toThrow();
  });

  it("should allow to set a flag without passing any data", () => {
    entity.setFlag(dirty);

    expect(entity.has(dirty)).toBe(true);
    expect(() => entity.get(dirty)).not.toThrow();
  });

  it("should inform that a component has been added", () => {
    const spiesOnAddingComponent = [jest.fn(), jest.fn()];
    spiesOnAddingComponent.forEach((spy) => entity.onComponentAdded(spy));

    entity.set(position, { x: 1, y: 2 });

    spiesOnAddingComponent.forEach((spy) => {
      expect(spy).toHaveBeenCalledWith(entity, position);
    });
  });

  it("should not inform that a component has been added if it was already present", () => {
    const spyOnAddingComponent = jest.fn();
    entity.onComponentAdded(spyOnAddingComponent);

    entity.set(position, { x: 1, y: 2 });
    entity.set(position, { x: 2, y: 2 });

    expect(spyOnAddingComponent).toHaveBeenCalledTimes(1);
  });

  it("should inform that a component has been removed", () => {
    const spiesOnRemovingComponent = [jest.fn(), jest.fn()];
    spiesOnRemovingComponent.forEach((spy) => {
      entity.onComponentRemoved(spy);
    });
    entity.set(position, { x: 1, y: 2 });

    entity.remove(position);

    spiesOnRemovingComponent.forEach((spy) => {
      expect(spy).toHaveBeenCalledWith(entity, position);
    });
  });

  it("should not inform that a component has been removed if it was already absent", () => {
    const spyOnRemovingComponent = jest.fn();
    entity.onComponentRemoved(spyOnRemovingComponent);

    entity.remove(position);

    expect(spyOnRemovingComponent).not.toHaveBeenCalled();
  });
});
