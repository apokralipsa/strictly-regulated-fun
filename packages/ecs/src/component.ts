type TypeGuard<T> = (input: any) => input is T;

export interface Component<T> {
  readonly componentId: string;
  readonly typeGuard?: TypeGuard<T>;
}

export type Flag = Component<unknown>;

export function isComponent(input: any): input is Component<any> {
  return input && input.componentId;
}

interface ComponentDefinitionOptions<T> {
  typeGuard?: TypeGuard<T>;
}

interface ComponentsToDefine<T> {
  [id: string]: ComponentDefinitionOptions<T>;
}

type Result<T, C extends ComponentsToDefine<T>> = {
  [id in keyof C]: Component<T>;
};

export function define<T, C extends ComponentsToDefine<T>>(
  componentsToDefine: C & ComponentsToDefine<T>
): Result<T, C> {
  return Object.fromEntries(
    Object.entries(componentsToDefine).map(([id, options]) => [
      id,
      { componentId: id, typeGuard: options.typeGuard },
    ])
  ) as Result<T, C>;
}

export function as<T>(
  options?: ComponentDefinitionOptions<T>
): ComponentDefinitionOptions<T> {
  return options || {};
}

export function asFlag(): ComponentDefinitionOptions<unknown>{
  return {};
}
