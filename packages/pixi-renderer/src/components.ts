import { As, Component, define } from "@strictly-regulated-fun/ecs";
import * as PIXI from "pixi.js";

export type TextureDefinition = string;

export interface RendererConfig {
  loader: PIXI.Loader;
  textures: { [name: string]: TextureDefinition };
}

export interface Sprite<KnownTexture> {
  type: "Sprite";
  texture: KnownTexture;
}

export function configureRenderingComponent<C extends RendererConfig>(
  config: C
): { render: Component<Sprite<keyof typeof config["textures"]>> } {

  Object.entries(config.textures).forEach(([textureName, src]) => {
    config.loader.add(textureName, src);
  });

  return define({
    render: As.a<Sprite<keyof typeof config["textures"]>>(),
  });
}
