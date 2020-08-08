import { Point } from "./model/point";
import { Vector } from "./model/vector";
import { Angle } from './model/angle';
import { As, define } from '@strictly-regulated-fun/ecs';

export const simple2dComponents = define({
  position: As.a<Point>(),
  velocity: As.a<Vector>(),
  maximumVelocity: As.a<number>(),
  acceleration: As.a<Vector>(),
  rotation: As.an<Angle>(),
  angularVelocity: As.an<Angle>(),
  angularAcceleration: As.an<Angle>()
});
