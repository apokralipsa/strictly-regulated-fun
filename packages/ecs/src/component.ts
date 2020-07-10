type TypeGuard<T> = (input: any) => input is T;

export interface Component<T> {
  typeGuard?: TypeGuard<T>;
}

export interface ComponentDefinitionOptions<T> {
  typeGuard?: TypeGuard<T>;
}

export function defineComponent<T>(
  options: ComponentDefinitionOptions<T> = {}
): Component<T> {
  return { typeGuard: options?.typeGuard };
}
