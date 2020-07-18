import { Component } from "./component";
import { Entity } from "./entity";

export type Query = {
  [name: string]: Component<unknown>;
};

export type QueriedState<Q extends Query> = {
  [key in keyof Q]: Q[key] extends Component<infer T> ? T : never;
};

export type Result<Q extends Query> = Map<Entity, QueriedState<Q>>;

export interface Entities {
  thatHave<Q extends Query>(query: Q): Result<Q>;
}
