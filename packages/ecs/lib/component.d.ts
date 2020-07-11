declare type TypeGuard<T> = (input: any) => input is T;
export interface Component<T> {
    typeGuard?: TypeGuard<T>;
}
export declare type Flag = Component<void>;
export interface ComponentDefinitionOptions<T> {
    typeGuard?: TypeGuard<T>;
}
export declare function defineComponent<T>(options?: ComponentDefinitionOptions<T>): Component<T>;
export declare function defineFlag(): Flag;
export {};
