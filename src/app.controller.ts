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
  public getCreature(@Param('tokenId') tokenId: string) {
    console.log(tokenId);

    return {
      name: 'some name',
      description:
        'Friendly OpenSea Creature that enjoys long swims in the ocean.',
      image: 'image_url',
      external_url: 'https://openseacreatures.io/%s',
      attributes: [],
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
