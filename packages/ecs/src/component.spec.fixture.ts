import { defineComponent, defineFlag } from './component';

export const hp = defineComponent<number>({ id: 'hp' });
export const fireDamage = defineComponent<number>({ id: 'fireDamage' });
export const poisonDamage = defineComponent<number>({ id: 'poisonDamage' });

export interface Vector2D {
  x: number;
  y: number;
}

export function isVector2d(input: any): input is Vector2D {
  return input && typeof input.x === 'number' && typeof input.y === 'number';
}

export const position = defineComponent<Vector2D>({ id: 'position' });
export const velocity = defineComponent<Vector2D>({ id: 'velocity' });
export const unknownComponent = defineComponent<unknown>({ id: 'unknown' });
export const strictPosition = defineComponent<Vector2D>({
  id: 'strict position',
  typeGuard: isVector2d
});
export const dirty = defineFlag({ id: 'dirty' });
export const incorrectData: any = { foo: 'bar' };
