import { Component, defineComponent } from "./component";

export interface Position {
  x: number;
  y: number;
}

export function isPosition(input: any): input is Position {
  return typeof input.x === "number" && typeof input.y === "number";
}

describe("Component", () => {
  it("should be defined and specify the type of data it holds", () => {
    const position: Component<Position> = defineComponent<Position>();
    expect(position).toBeDefined();
  });

  it("should allow to provide runtime type checking mechanims", () => {
    const position = defineComponent<Position>({typeGuard: isPosition});
    expect(position.typeGuard).toBe(isPosition);
  });
});
