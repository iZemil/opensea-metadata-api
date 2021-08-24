import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Generator } from './generator/Generator';

async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);

  console.log(`Server runs on: http://localhost:${PORT}`);
  new Generator();
}
bootstrap();
