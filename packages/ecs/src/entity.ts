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

export type ComponentChangeCallback = (
  entity: Entity,
  component: Component<any>
) => void;

export class Entity {
  private readonly components: Map<Component<any>, any> = new Map();

  private onAddedCallbacks: ComponentChangeCallback[] = [];
  private onRemovedCallbacks: ComponentChangeCallback[] = [];

  constructor(private checkType: RuntimeTypeCheck = DoRuntimeTypeChecks) {}

  set<T>(component: Component<T>, data: T): Entity {
    if (this.onAddedCallbacks.length > 0 && !this.has(component)) {
      this.onAddedCallbacks.forEach((callback) => callback(this, component));
    }

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

  remove(component: Component<any>) {
    if (this.onRemovedCallbacks.length > 0 && this.has(component)) {
      this.onRemovedCallbacks.forEach((callback) => callback(this, component));
    }

    this.components.delete(component);
  }

  onComponentAdded(callback: ComponentChangeCallback) {
    this.onAddedCallbacks = [...this.onAddedCallbacks, callback];
  }

  onComponentRemoved(callback: ComponentChangeCallback) {
    this.onRemovedCallbacks = [...this.onRemovedCallbacks, callback];
  }
}
