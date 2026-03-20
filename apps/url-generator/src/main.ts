import { NestFactory } from '@nestjs/core';
import { UrlGeneratorModule } from './url-generator.module';

async function bootstrap() {
  const app = await NestFactory.create(UrlGeneratorModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
