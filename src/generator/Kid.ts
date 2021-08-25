import * as images from 'images';
import * as path from 'path';
import { TLayerGroup } from './assets/constants';

/** Layer image paths */
export type TKidLayers = Record<TLayerGroup, string>;
export interface IKidOptions {
  layers: TKidLayers;
  index: number;
}

export class Kid {
  public readonly options: IKidOptions;
  public readonly key: string;

  constructor(options: IKidOptions) {
    this.options = options;
    this.key = Kid.createKey(options.layers);
  }

  private image(group: string, name: string): images.Image {
    const outputPath = path.resolve(
      `./src/generator/assets/outputs/${group}/${name}.png`,
    );

    return images(outputPath);
  }

  public save(kidName: string): void {
    const {
      layers: { Faces, Heads, Eyes, Eyebrows, Noses, Mouths, Ears },
    } = this.options;

    try {
      this.image('Faces', Faces)
        .draw(this.image('Heads', Heads), 0, 0)
        .draw(this.image('Eyes', Eyes), 0, 0)
        .draw(this.image('Eyebrows', Eyebrows), 0, 0)
        .draw(this.image('Noses', Noses), 0, 0)
        .draw(this.image('Mouths', Mouths), 0, 0)
        .draw(this.image('Ears', Ears), 0, 0)
        .save(path.resolve(`./src/generator/kids/${kidName}.png`));
    } catch (error) {
      console.log('[composeKid] error: ', error);
    }
  }

  public static create(kidKey: string): void {
    // TODO: parse kidKey and save
  }

  public static createKey(layers: TKidLayers): string {
    const keys = Object.entries(layers).map(
      ([groupName, layerName]) => `${groupName}:${layerName}`,
    );

    return keys.reduce(
      (acc, curr, keyIndex) => `${acc}${keyIndex ? ';' : ''}${curr}`,
      '',
    );
  }

  public static initials(): TKidLayers {
    return {
      Faces: null,
      Heads: null,
      Eyes: null,
      Eyebrows: null,
      Noses: null,
      Mouths: null,
      Ears: null,
      Cheeks: null,
    };
  }
}
