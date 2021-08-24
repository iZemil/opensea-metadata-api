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
    // this.key = Kid.createKey(
    //   ...options.layers,
    // );

    // this.renderLayers();
  }

  private image(group: string, name: string): images.Image {
    const outputPath = path.resolve(
      `./src/generator/assets/outputs/${group}/${name}`,
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

  //   private renderLayers(): Kid {
  //     const map = this.scene.make.tilemap({
  //       key: 'map',
  //     });
  //     const tileset = map.addTilesetImage('tiles', 'tiles');
  //     const { x, y } = this.offsets;

  //     this.options.layers.forEach((layer) => {
  //       const tiledLayer = map.createLayer(layer.tiled.name, [tileset], x, y);
  //       const group = layer.options.group;

  //       // Замена цвета глаз
  //       if (group === 'Eyes') {
  //         tiledLayer.forEachTile((tile) => {
  //           if (tile.properties.type === TILE_PROPS.type.eyes) {
  //             tiledLayer.replaceByIndex(tile.index, layer.options.tileIndex + 1);
  //           }
  //         });
  //       }

  //       // Замена цвета кожи
  //       if (group === 'Faces') {
  //         tiledLayer.forEachTile((tile) => {
  //           if (tile.properties.type === TILE_PROPS.type.skin) {
  //             tiledLayer.replaceByIndex(tile.index, layer.options.tileIndex + 1);
  //           }
  //         });
  //       }

  //       tiledLayer.setScale(this.scale);
  //     });

  //     return this;
  //   }

  public static createKey(...keys: string[]): string {
    return keys.reduce(
      (acc, curr, keyIndex) => `${acc}${keyIndex ? '__' : ''}${curr}`,
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
