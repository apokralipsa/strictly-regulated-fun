import {
  directionOf,
  lengthOf,
  multiplied,
  normalized,
  sumOf,
  Vector,
  vectorInDirection,
} from "./vector";

describe("Vector", () => {
  const x: Vector = { dx: 5, dy: 0 };
  const y: Vector = { dx: 0, dy: 10 };
  const xAndY: Vector = { dx: 4, dy: 3 };

  it("should have a length", () => {
    expect(lengthOf(x)).toBe(5);
    expect(lengthOf(y)).toBe(10);
    expect(lengthOf(xAndY)).toBe(5);
  });

  it("should have a length of 1 after it has been normalized", () => {
    expect(normalized(x)).toEqual({ dx: 1, dy: 0 });
    expect(normalized(y)).toEqual({ dx: 0, dy: 1 });
    expect(normalized(xAndY)).toEqual({ dx: 4 / 5, dy: 3 / 5 });
  });

  it("should be multiplied by a scalar", () => {
    expect(multiplied(xAndY, 2)).toEqual({ dx: 8, dy: 6 });
    expect(multiplied(xAndY, -1)).toEqual({ dx: -4, dy: -3 });
  });

  it("should calculate the sum", () => {
    expect(sumOf(x, y)).toEqual({ dx: 5, dy: 10 });
    expect(sumOf(x, multiplied(xAndY, -1))).toEqual({ dx: 1, dy: -3 });
  });

  it("should have a direction", () => {
    expect(directionOf(x)).toEqual(0);
    expect(directionOf(y)).toEqual(Math.PI / 2);
    expect(directionOf(multiplied(y, -1))).toEqual(-Math.PI / 2);
    expect(directionOf(multiplied(x, -1))).toEqual(-Math.PI);
    expect(directionOf({ dx: -999999, dy: 0.0000001 })).toBeCloseTo(Math.PI);
  });

  it("should be constructed with a given direction and length", () => {
    expect(vectorInDirection(0, 5).dx).toEqual(5);
    expect(vectorInDirection(0, 5).dy).toBeCloseTo(0);

    expect(vectorInDirection(-2 * Math.PI, 5).dx).toEqual(5);
    expect(vectorInDirection(-2 * Math.PI, 5).dy).toBeCloseTo(0);

    expect(vectorInDirection(Math.PI / 2, 10).dx).toBeCloseTo(0);
    expect(vectorInDirection(Math.PI / 2, 10).dy).toEqual(10);

    expect(vectorInDirection(-Math.PI, 5).dx).toEqual(-5);
    expect(vectorInDirection(-Math.PI, 5).dy).toBeCloseTo(0);

    expect(vectorInDirection(-Math.PI / 2, 10).dx).toBeCloseTo(0);
    expect(vectorInDirection(-Math.PI / 2, 10).dy).toEqual(-10);
  });
});
