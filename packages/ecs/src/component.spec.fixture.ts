import { As, define } from './component';

export const { hp, fireDamage, poisonDamage } = define({
  hp: As.a<number>(),
  fireDamage: As.a<number>(),
  poisonDamage: As.a<number>()
});

export interface Vector2D {
  x: number;
  y: number;
}

export function isVector2d(input: any): input is Vector2D {
  return input && typeof input.x === "number" && typeof input.y === "number";
}

export const { position, velocity, strictPosition } = define({
  position: As.a<Vector2D>(),
  velocity: As.a<Vector2D>(),
  strictPosition: As.a<Vector2D>({ typeGuard: isVector2d }),
});

export const { unknownComponent } = define({
  unknownComponent: As.an<unknown>(),
});
export const { dirty } = define({ dirty: As.aFlag() });
export const incorrectData: any = { foo: "bar" };
