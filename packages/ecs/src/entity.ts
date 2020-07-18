import { Component, Flag } from './component';

export interface Entity {
  set<T>(component: Component<T>, data: T): Entity;
  setFlag(flag: Flag): Entity;
  get<T>(component: Component<T>): T;
  has(component: Component<any>): boolean;
  remove(component: Component<any>): Entity;
}

