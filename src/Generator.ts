import * as images from 'images';
import * as path from 'path';
import { promises as fs, mkdirSync } from 'fs';
import {
  createCanvas,
  loadImage,
  Canvas,
  NodeCanvasRenderingContext2D,
} from 'canvas';

import * as tiledMap from './assets/map.json';

export class Generator {
  private readonly output = path.resolve('./src/assets/outputs');
  private readonly tileSize = 8;
  private readonly size = 256;

  public readonly canvas: Canvas;
  public readonly context: NodeCanvasRenderingContext2D;
  public readonly tiledMap = tiledMap;

  public tiles: Record<string, Canvas> = {};

  get rowCount(): number {
    return this.tiledMap.width;
  }

  constructor() {
    console.log('_ _ _ _Generator_ _ _ _');
    this.canvas = createCanvas(this.size, this.size);
    this.context = this.canvas.getContext('2d');
    // this.init();
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

  private generateFace(): void {
    this.image('Faces', 'Face2#Multi')
      .draw(this.image('Eyes', 'Eyes4#Multi'), 0, 0)
      .draw(this.image('Noses', 'Nose0'), 0, 0)
      .draw(this.image('Mouths', 'Mouth0'), 0, 0)
      .save(this.outputImg('1'));
  }

  private asset(group: string, name: string): string {
    return path.resolve(`./src/assets/${group}/${name}.png`);
  }

  private outputImg(imgName: string): string {
    return path.resolve(`${this.output}/${imgName}.png`);
  }

  private image(group: string, name: string): images.Image {
    return images(this.asset(group, name));
  }
}
