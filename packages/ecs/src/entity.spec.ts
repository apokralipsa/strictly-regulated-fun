import { defineComponent } from "./component";
import { Entity, SkipRuntimeTypeChecks } from './entity';

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
    expect(() => entity.set(position, JSON.parse(incorrectDataInJson))).not.toThrow();
    expect(() => entity.set(strictPosition, JSON.parse(incorrectDataInJson))).toThrow(
      `Could not set component because the data did not pass runtime type check: ${incorrectDataInJson}`
    );
  });

  it('should allow to skip runtime checks', () => {
    expect(() => new Entity(SkipRuntimeTypeChecks).set(position, JSON.parse(incorrectDataInJson))).not.toThrow();
  });
});
