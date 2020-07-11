import { Component, Flag } from "./component";
export declare type RuntimeTypeCheck = (component: Component<any>, input: any) => void;
export declare const SkipRuntimeTypeChecks: RuntimeTypeCheck;
export declare const DoRuntimeTypeChecks: RuntimeTypeCheck;
export declare class Entity {
    private checkType;
    private readonly components;
    constructor(checkType?: RuntimeTypeCheck);
    set<T>(component: Component<T>, data: T): Entity;
    setFlag(flag: Flag): this;
    get<T>(component: Component<T>): Readonly<T>;
    has(component: Component<any>): boolean;
}
