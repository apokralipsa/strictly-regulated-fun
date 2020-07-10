import { Component } from './component';
import { Entity } from './entity';

export type Query<T> = Component<T>;

export interface System<T> {
  query: Query<T>
  run: (entity: Entity, data: Readonly<T>, deltaTime: number) => void
}
