import { Component } from "./component";
import { Entity } from "./entity";

export type Query = {
  [name: string]: Component<any>;
};

export type Result<C extends Query> = {
  [key in keyof C]: C[key] extends Component<infer T> ? Readonly<T> : never;
};

export interface System<Q extends Query> {
  readonly name: string;
  query: Q;
  run: (entity: Entity, data: Result<Q>) => void;
  tick?: (deltaTime: number) => void;
}

export abstract class StatefulSystem<Q extends Query>
  implements System<Q> {
  readonly name;

  protected constructor() {
    this.name = this.constructor.name;
  }

  abstract query: Q;

  abstract run(entity: Entity, data: Result<Q>): void;
}
