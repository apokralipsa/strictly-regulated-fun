import { Entities } from './entities';

export interface System {
  readonly name: string;
  run: (entities: Entities) => void;
  tick?: (deltaTime: number) => void;
}

export abstract class StatefulSystem
  implements System {
  readonly name;

  constructor() {
    this.name = this.constructor.name;
  }


  abstract run(entities: Entities): void;
}
