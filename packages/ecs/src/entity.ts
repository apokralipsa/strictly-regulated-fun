import { Component, Flag } from "./component";

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

export class Entity {
  private readonly components: Map<Component<any>, any> = new Map();

  constructor(private checkType: RuntimeTypeCheck = DoRuntimeTypeChecks) {}

  set<T>(component: Component<T>, data: T): Entity {
    this.checkType(component, data);
    this.components.set(component, data);
    return this;
  }

  setFlag(flag: Flag) {
    this.components.set(flag, null);
    return this;
  }

  get<T>(component: Component<T>): Readonly<T> {
    if (!this.components.has(component)) {
      throw new Error(`Entity does not contain the requested component`);
    }
    let data = this.components.get(component);
    return data as Readonly<T>;
  }

  has(component: Component<any>): boolean {
    return this.components.has(component);
  }
}
