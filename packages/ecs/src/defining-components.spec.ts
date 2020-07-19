import { As, Component, define } from './component';
import { isVector2d, Vector2D } from './component.spec.fixture';

describe("Component", () => {
  it("should be defined and specify the type of data it holds", () => {
    const { position } = define({ position: As.a<Vector2D>() });
    expect(position).toBeDefined();
  });

  it("should allow to provide runtime type checking mechanism", () => {
    const { strictPosition } = define({
      strictPosition: As.a<Vector2D>({ typeGuard: isVector2d }),
    });

    expect(strictPosition.typeGuard).toBe(isVector2d);
  });

  it('should allow to create "flag" components with no data', () => {
    const { flag } = define({ "flag": As.aFlag() });
    expect(flag).toBeDefined();
  });
});
