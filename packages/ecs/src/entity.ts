import { Component, Flag } from "./component";

export type StateOf<C extends Component<any>> = C extends Component<infer T>
  ? T
  : never;

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
   * @see System
   * @see Component
   */
  set<C extends Component<any>>(component: C, data: StateOf<C>): Entity;

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
  get<C extends Component<any>>(component: C): StateOf<C>;

  /**
   * @param component to check
   * @return True, if the entity has the component. False otherwise.
   */
  has(component: Component<any>): boolean;

  /**
   * Removes a component from an entity
   * @param component
   */
  remove(component: Component<any>): Entity;

  /**
   * Use this method whenever you want to add or remove multiple components to / from an entity.
   * This will improve performance, as the underlying structure of entities will be updated
   * only once, after all components have been set.
   *
   * @return GroupedChanges
   */
  modify(): GroupedChanges;
}

/**
 * A set of changes that should be applied to an entity.
 * @see applyChanges
 */
export interface GroupedChanges {
  /**
   * Adds or modifies the state of a component on this entity.
   * Note: It is much cheaper to mutate a state directly using a system.
   * Use this method when you cannot guaranty that this entity already has this component.
   *
   * @param component The component to add
   * @param data The state of the component to set.
   *
   * @see System
   * @see Component
   */
  set<C extends Component<any>>(component: C, data: StateOf<C>): GroupedChanges;

  /**
   * Adds a flag to a component.
   * If the flag is already set, does nothing.
   *
   * @param flag The flag to set.
   * @see Flag
   */
  setFlag(flag: Flag): GroupedChanges;

  /**
   * Removes a component from an entity.
   *
   * @param component
   */
  remove(component: Component<any>): GroupedChanges;

  /**
   * Applies all the changes in a single run.
   * @return The original entity that was modified.
   */
  applyChanges(): Entity;
}
