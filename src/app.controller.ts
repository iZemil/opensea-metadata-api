import { promises as fs } from 'fs';
import * as path from 'path';
import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getApi(): string {
    return this.appService.getApi();
  }

  @Get('creature/:tokenId')
  public async getCreature(@Param('tokenId') tokenId: string) {
    console.log(tokenId);

    // const img = require('./images/kid1.png');
    const imagesPath = path.resolve('./src/images');
    // fs.readdir(path.resolve('./src/images'), (err, files) => {
    //   console.log(err, files);
    // });
    const files = await fs.readdir(path.resolve());

    // TODO: connect generator
    // TODO: защита от дубликации может быть локально в нейминге
    return {
      name: 'kid1',
      description: '',
      image: `https://nft-metadata-api-server.herokuapp.com/${'kid1'}.png`,
      files,
      background_color: 'ff0000',
      // external_url: 'https://openseacreatures.io/%s',
      attributes: [
        {
          display_type: 'date',
          trait_type: 'birthday',
          value: 1546360800,
        },
      ],
    };
  }

  // @app.route('/api/box/creature/<token_id>')@Get('creature/:tokenId')
  // public getCreature(@Param('tokenId') tokenId: string) {
  //   return tokenId;
  // }
  // @app.route('/api/factory/creature/<token_id>')
  // @app.route('/api/accessory/<token_id>')
  // @app.route('/api/box/accessory/<token_id>')
  // @app.route('/api/factory/accessory/<token_id>')
  // @app.route('/contract/<contract_name>')
}
