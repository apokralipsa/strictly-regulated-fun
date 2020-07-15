type TypeGuard<T> = (input: any) => input is T;

export interface Component<T> {
  readonly componentId: string;
  readonly typeGuard?: TypeGuard<T>;
}

export type Flag = Component<any>;

export function isComponent(input: any): input is Component<any> {
  return input && input.componentId;
}

interface ComponentDefinitionOptions<T> {
  id: string;
  typeGuard?: TypeGuard<T>;
}

export function defineComponent<T>(
  options: ComponentDefinitionOptions<T>
): Component<T> {
  return { componentId: options.id, typeGuard: options.typeGuard };
}

interface FlagDefinitionOptions {
  id: string;
}

export function defineFlag(options: FlagDefinitionOptions): Flag {
  return { componentId: options.id };
}
