type TypeGuard<T> = (input: any) => input is T;

const componentId = Symbol.for('componentId');

/**
 * A piece of state that can be added to an Entity.
 * Entities can be filtered by the Components they have.
 *
 * @param <T> the type of data stored by this component
 */
export interface Component<T> {
  readonly [componentId]: string;
  readonly typeGuard?: TypeGuard<T>;
}

/**
 * A "marker" component that does not hold any state.
 * Used only to filter entities.
 */
export type Flag = Component<unknown>;

interface ComponentDefinitionOptions<T> {
  typeGuard?: TypeGuard<T>;
}

interface ComponentsToDefine<T> {
  [id: string]: ComponentDefinitionOptions<T>;
}

type DefinedComponents<C extends ComponentsToDefine<any>> = {
  [id in keyof C]: C[id] extends ComponentDefinitionOptions<infer T>
    ? Component<T>
    : never;
};

/**
 * Defines one or more components or flags.
 * @example
 * const { hp } = define({ hp: As.a<number>() })
 *
 * @param componentsToDefine Object, whose every property becomes an identifier of a component.
 * @see As
 */
export function define<C extends ComponentsToDefine<any>>(
  componentsToDefine: C
): DefinedComponents<C> {
  const entries = Object.entries(componentsToDefine);

  const definedComponents = entries.map(([id, options]) => {
    return [id, { [componentId]: id, ...options }];
  });

  return Object.fromEntries(definedComponents);
}

/**
 * Helper object. Provides functions that aid in defining components.
 */
export const As = {
  /**
   * Defines the type of a component
   *
   * @param options Optional. Additional component options.
   */
  a<T>(options: ComponentDefinitionOptions<T> = {}) {
    return options;
  },

  /**
   * An alias for "As.a<type>".
   *
   * @param options Optional. Additional component options.
   * @see As.a
   */
  an<T>(options: ComponentDefinitionOptions<T> = {}) {
    return options;
  },

  /**
   * Defines that the component is a flag and does not store any data.
   */
  aFlag(): ComponentDefinitionOptions<unknown> {
    return {};
  },
};
