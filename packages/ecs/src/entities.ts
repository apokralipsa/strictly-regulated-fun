import { Component } from './component';
import { Entity } from './entity';

/**
 * A set of one or more components.
 *
 * @example
 * const { hp, fireDamage } = define({hp: As.a<number>(), fireDamage: As.a<number>() })
 * const myQuery = { hp, fireDamage }
 */
export type Query = {
  [name: string]: Component<unknown>;
};

/**
 * The state of the entity.
 * It is guarantied to have data of all the requested components.
 * It can be accessed and modified in a typesafe way.
 */
export type QueriedState<Q extends Query> = {
  [key in keyof Q]: Q[key] extends Component<infer T> ? T : never;
};

/**
 * Represents all entities, that exist in an engine running a system.
 */
export interface Entities {
  /**
   * Finds all entities that have all components required by a Query.
   * @example
   * for (const [entity, state] of entities.thatHave({ hp })) {
   *  if(state.hp <= 0){
   *    engine.remove(entity);
   *  }
   * }
   *
   *
   * @return a readonly map, where each key is an entity and the value is its queried state.
   * @param query A set of components
   * @see Query
   * @see QueriedState
   */
  thatHave<Q extends Query>(query: Q): ReadonlyMap<Entity, QueriedState<Q>>;
}
