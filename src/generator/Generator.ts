import * as path from 'path';
import { promises as fs, mkdirSync, readdirSync, rmdirSync } from 'fs';
import {
  createCanvas,
  loadImage,
  Canvas,
  NodeCanvasRenderingContext2D,
} from 'canvas';

import * as tiledMap from './assets/map.json';
import { TKidLayers, Kid } from './Kid';
import { LAYER_GROUPS, TLayerGroup, TLayerMap } from './assets/constants';

export class Generator {
  private readonly output = path.resolve('./src/generator/assets/outputs');

  public readonly canvas: Canvas;
  public readonly context: NodeCanvasRenderingContext2D;
  public readonly tiledMap = tiledMap;

  public tiles: Record<string, Canvas> = {};

  public layersMap: TLayerMap;
  public kids: Record<string, Kid> = {};

  get tileSize(): number {
    return this.tiledMap.tilewidth;
  }

  get rowCount(): number {
    return this.tiledMap.width;
  }

  get size(): number {
    return this.tileSize * this.rowCount;
  }

  constructor() {
    console.log('_ _ _ _Generator_ _ _ _');
    this.canvas = createCanvas(this.size, this.size);
    this.context = this.canvas.getContext('2d');

    // this.init();
    this.composeKids();
  }

  public async init(): Promise<void> {
    await this.initTiles();
    await this.initDirs();
    await this.initLayers();
  }

  private async initTiles(): Promise<void> {
    const tilesImg = await loadImage('./src/assets/tiles.png');

    const { width, height } = tilesImg;
    const cols = Math.trunc(width / this.tileSize);
    const rows = Math.trunc(height / this.tileSize);

    let count = 0;
    Array.from({ length: cols }).forEach((_, colIndex) => {
      Array.from({ length: rows }).forEach((_, rowIndex) => {
        const canvas = createCanvas(this.tileSize, this.tileSize);
        const ctx = canvas.getContext('2d');
        const x = rowIndex * this.tileSize;
        const y = colIndex * this.tileSize;

        ctx.drawImage(
          tilesImg,
          x,
          y,
          this.tileSize,
          this.tileSize,
          0,
          0,
          this.tileSize,
          this.tileSize,
        );

        this.tiles[String(count)] = canvas;

        count += 1;
      });
    });
  }

  private async initDirs(): Promise<Generator> {
    await fs.rmdir(this.output, { recursive: true });

    mkdirSync(this.output);

    this.tiledMap.layers.forEach((group) => {
      if (group.type === 'group') {
        const dirName = group.name;
        mkdirSync(path.resolve(`${this.output}/${dirName}`));

        console.log(`+ Dir: ${dirName}`);
      }
    });

    return this;
  }

  private async initLayers(): Promise<void> {
    // fill canvas with bg
    // this.context.fillStyle = '#fff';
    // this.context.fillRect(0, 0, this.size, this.size);

    for await (const group of this.tiledMap.layers) {
      const groupDir = group.name;

      if (group.type === 'group') {
        for await (const layer of group.layers) {
          this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

          let rowIndex = 0;
          let index = 0;
          for await (const tileIndex of layer.data) {
            const isEmpty = tileIndex === 0;

            // render
            if (!isEmpty) {
              const x = ((index % this.rowCount) - 1) * this.tileSize;
              const y = (rowIndex - 1) * this.tileSize;
              const tile = this.tiles[String(tileIndex - 1)];

              this.context.drawImage(tile, x, y, this.tileSize, this.tileSize);
            }

            if (index % this.rowCount === 0) {
              rowIndex += 1;
            }

            index += 1;
          }

          const canvasBuffer = this.canvas.toBuffer('image/png');
          await this.saveImg(`${groupDir}/${layer.name}`, canvasBuffer);
        }
      }
    }
  }

  private async saveImg(name: string, buffer: Buffer): Promise<void> {
    try {
      await fs.writeFile(this.outputImg(name), buffer);
      console.log(`Image: ${name} succes`);
    } catch (error) {
      console.log(`Image: ${name} error:`, error);
    }
  }

  private outputImg(imgName: string): string {
    return path.resolve(`${this.output}/${imgName}.png`);
  }

  private formLayersMap(): TLayerMap {
    const layersMap = Object.fromEntries(
      LAYER_GROUPS.map((groupkey) => [groupkey, []]),
    ) as TLayerMap;

    readdirSync(this.output).forEach((dir) => {
      readdirSync(`${this.output}/${dir}/`).forEach((img) => {
        layersMap[dir].push(img);
      });
    });

    return layersMap;
  }

  private composeKids(): void {
    this.layersMap = this.formLayersMap();

    console.time('[composeKids]');
    let count = 0;
    this.composeKid(0, Kid.initials(), (accumulatedLayers) => {
      const isExcluded = false;
      if (!isExcluded) {
        const kid = new Kid({
          layers: accumulatedLayers,
          index: count,
        });
        this.kids[kid.key] = kid;

        count += 1;
      }
    });
    console.timeEnd('[composeKids]');

    // Try pngs
    console.time('[saveKids]');
    // const kidsDirPath = path.resolve('./src/kids');
    // rmdirSync(kidsDirPath, { recursive: true });
    // mkdirSync(kidsDirPath);
    // Object.entries(this.kids)
    //   .slice(0, 500)
    //   .forEach(([kidName, kid]) => {
    //     kid.save(kidName);
    //   });
    console.timeEnd('[saveKids]');

    // this.saveKidsToJson();
  }

  private async saveKidsToJson(): Promise<void> {
    try {
      const data = Object.fromEntries(
        Object.entries(this.kids).map(([kidKey, kid]) => [
          kid.options.index,
          kidKey,
        ]),
      );
      const kidsJson = JSON.stringify(data);
      await fs.writeFile(
        path.resolve('./src/generator/kids/kids.json'),
        kidsJson,
      );
    } catch (error) {
      console.log('[saveKidsToJson] error', error);
    }
  }

  private composeKid(
    groupIndex: number,
    layers: TKidLayers,
    onFinish: (accumulatedLayers: TKidLayers) => void,
  ): void {
    const isLastParam = groupIndex === LAYER_GROUPS.length;

    if (isLastParam) {
      onFinish(layers);
    } else {
      const layerGroupName = LAYER_GROUPS[groupIndex];
      const groupLayers = this.layersMap[layerGroupName];

      Object.values(groupLayers).forEach((layerName) => {
        this.composeKid(
          groupIndex + 1,
          { ...layers, [layerGroupName]: layerName.replace('.png', '') },
          onFinish,
        );
      });
    }
  }
}
