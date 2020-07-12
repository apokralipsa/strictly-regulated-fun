type TypeGuard<T> = (input: any) => input is T;

export interface Component<T> {
  id: string;
  typeGuard?: TypeGuard<T>;
}

export type Flag = Component<void>;

interface ComponentDefinitionOptions<T> {
  id: string;
  typeGuard?: TypeGuard<T>;
}

export function defineComponent<T>(
  options: ComponentDefinitionOptions<T>
): Component<T> {
  return { ...options };
}

interface FlagDefinitionOptions {
  id: string;
}

export function defineFlag(options: FlagDefinitionOptions): Flag {
  return { ...options };
}
