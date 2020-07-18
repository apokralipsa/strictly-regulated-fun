import { Component, defineComponent, defineFlag } from "./component";
import { isVector2d, Vector2D } from "./component.spec.fixture";

describe("Component", () => {
  it("should be defined and specify the type of data it holds", () => {
    const position: Component<Vector2D> = defineComponent<Vector2D>({
      id: "position",
    });
    expect(position).toBeDefined();
  });

  it("should allow to provide runtime type checking mechanism", () => {
    const position = defineComponent<Vector2D>({
      id: "strict position",
      typeGuard: isVector2d,
    });
    expect(position.typeGuard).toBe(isVector2d);
  });

  it('should allow to create "flag" components with no data', () => {
    const flag: Component<void> = defineFlag({ id: "my flag" });
    expect(flag).toBeDefined();
  });
});
