import { Component, Flag } from './component';

export type RuntimeTypeCheck = (component: Component<any>, input: any) => void;
export const SkipRuntimeTypeChecks: RuntimeTypeCheck = () => {};
export const DoRuntimeTypeChecks: RuntimeTypeCheck = (component, input) => {
  if (component.typeGuard && !component.typeGuard(input)) {
    const json = JSON.stringify(input);
    throw new Error(
      `Could not set component because the data did not pass runtime type check: ${json}`
    );
  }
};

export interface Entity {
  set<T>(component: Component<T>, data: T): Entity;

  setFlag(flag: Flag): Entity;

  get<T>(component: Component<T>): Readonly<T>;

  has(component: Component<any>): boolean;

  remove(component: Component<any>): Entity;
}

