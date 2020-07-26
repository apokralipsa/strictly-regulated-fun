import { configureRenderingComponent } from "./components";
import { createEngine, Engine } from "@strictly-regulated-fun/ecs";
import * as PIXI from "pixi.js";

describe("Sprites", () => {
  let pixiApp: PIXI.Application;
  let engine: Engine;

  beforeEach(() => {
    pixiApp = new PIXI.Application();
    spyOn(pixiApp.loader, "add");

    engine = createEngine();
  });

  it("should use preloaded textures", () => {
    const { render } = configureRenderingComponent({
      loader: pixiApp.loader,
      textures: {
        blueGuy: "some/assets/blueGuy",
        redGuy: "some/assets/redGuy",
      },
    });

    expect(pixiApp.loader.add).toHaveBeenCalledWith(
      "blueGuy",
      "some/assets/blueGuy"
    );

    expect(pixiApp.loader.add).toHaveBeenCalledWith(
      "redGuy",
      "some/assets/redGuy"
    );

    createEngine()
      .createEntity()
      .set(render, { type: "Sprite", texture: "blueGuy" });
    //.set(render, { type: "Sprite", texture: "greenGuy"}) // would fail with TS2322: Type '"greenGuy"' is not assignable to type '"blueGuy" | "redGuy"'.
  });
});
