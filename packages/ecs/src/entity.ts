import { Component, Flag } from "./component";

/**
 * A separate entity that has its own identity and state.
 */
export interface Entity {
  /**
   * Adds or modifies the state of a component on this entity.
   * Note: It is much cheaper to mutate a state directly using a system.
   * Use this method when you cannot guaranty that this entity already has this component.
   *
   * @param component The component to add
   * @param data The state of the component to set.
   *
   * @see System, Component
   */
  set<T>(component: Component<T>, data: T): Entity;

  /**
   * Adds a flag to a component.
   * If the flag is already set, does nothing.
   *
   * @param flag The flag to set.
   * @see Flag
   */
  setFlag(flag: Flag): Entity;

  /**
   * Gets the state of the component.
   * It is better to query the state using entities passed to a system.
   *
   * @param component The component to get
   * @throws If the entity does not have this component.
   * @see System, Entities
   */
  get<T>(component: Component<T>): T;
  has(component: Component<any>): boolean;
  remove(component: Component<any>): Entity;
}
