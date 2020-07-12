import { Component } from "./component";
import { Entity } from './entity';

export type CombinationOfComponents = {
  [name: string]: Component<any>;
};

export type CombinedData<C extends CombinationOfComponents> = {
  [key in keyof C]: C[key] extends Component<infer T> ? Readonly<T> : never;
};

export type Query<R> = Component<R> | CombinationOfComponents;

export type Result<Q extends Query<any>> = Q extends Component<infer T>
  ? Readonly<T>
  : Q extends CombinationOfComponents
  ? CombinedData<Q>
  : never;

export interface System<Q extends Query<any>> {
  readonly name: string;
  query: Q;
  run: (entity: Entity, data: Result<Q>) => void;
  tick?: (deltaTime: number) => void
}

export abstract class StatefulSystem<Q extends Query<any>>
  implements System<Q> {
  readonly name;

  protected constructor() {
    this.name = this.constructor.name;
  }

  abstract query: Q;

  abstract run(entity: Entity, data: Result<Q>): void;
}
