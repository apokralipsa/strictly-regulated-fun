import { As, Component, define } from "@strictly-regulated-fun/ecs";

export type TextureDefinition = string;

export interface RendererConfig {
  textures: { [name: string]: TextureDefinition };
}

export interface Sprite<KnownTexture> {
  type: "Sprite";
  texture: KnownTexture;
}

export function renderComponent<C extends RendererConfig>(
  config: C
): {render : Component<Sprite<keyof typeof config['textures']>>} {
  return define({
    render: As.a<Sprite<keyof typeof config['textures']>>(),
  });
}
