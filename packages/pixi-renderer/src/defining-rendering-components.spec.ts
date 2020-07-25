import { renderComponent } from './components';
import { createEngine } from '@strictly-regulated-fun/ecs';

describe("Sprites", () => {
  it("should preload defined textures", () => {
    const { render } = renderComponent({ textures: { blueGuy: "guy" } });
    createEngine().createEntity().set(render, {type: 'Sprite', texture: 'blueGuy'})
  });
});
