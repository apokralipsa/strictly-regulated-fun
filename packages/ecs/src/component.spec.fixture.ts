import { as, asFlag, define } from "./component";

export const { hp, fireDamage, poisonDamage } = define({
  hp: as<number>(),
  fireDamage: as<number>(),
  poisonDamage: as<number>(),
});

export interface Vector2D {
  x: number;
  y: number;
}

export function isVector2d(input: any): input is Vector2D {
  return input && typeof input.x === "number" && typeof input.y === "number";
}

export const { position, velocity, strictPosition } = define({
  position: as<Vector2D>(),
  velocity: as<Vector2D>(),
  strictPosition: as<Vector2D>({ typeGuard: isVector2d }),
});

export const { unknownComponent } = define({ unknownComponent: as<unknown>() });
export const { dirty } = define({ dirty: asFlag() });
export const incorrectData: any = { foo: "bar" };
