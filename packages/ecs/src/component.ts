type TypeGuard<T> = (input: any) => input is T;

export interface Component<T> {
  readonly componentId: string;
  readonly typeGuard?: TypeGuard<T>;
}

export type Flag = Component<unknown>;

interface ComponentDefinitionOptions<T> {
  typeGuard?: TypeGuard<T>;
}

interface ComponentsToDefine<T> {
  [id: string]: ComponentDefinitionOptions<T>;
}

type Result<C extends ComponentsToDefine<any>> = {
  [id in keyof C]: C[id] extends ComponentDefinitionOptions<infer T>
    ? Component<T>
    : never;
};

export function define<C extends ComponentsToDefine<any>>(
  componentsToDefine: C
): Result<C> {
  const entries = Object.entries(componentsToDefine);

  const definedComponents = entries.map(([id, options]) => {
    return [id, { componentId: id, ...options }];
  });

  return Object.fromEntries(definedComponents);
}

export const As = {
  a<T>(options: ComponentDefinitionOptions<T> = {}) {
    return options;
  },

  an<T>(options: ComponentDefinitionOptions<T> = {}) {
    return options;
  },

  aFlag(): ComponentDefinitionOptions<unknown> {
    return {};
  },
};
