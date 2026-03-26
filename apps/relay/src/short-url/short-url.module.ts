import { Module } from '@nestjs/common';
import { ShortUrlService } from './short-url.service';
import { ShortUrlController } from './short-url.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { existsSync } from 'fs';
import { join } from 'path';

const sharedProtoDir = join(process.cwd(), 'libs/shared/proto');
const shortUrlProtoPath = join(__dirname, 'proto/shorturl.proto');

@Module({
  controllers: [ShortUrlController],
  providers: [ShortUrlService],
  imports: [
    ClientsModule.register([
      {
        name: 'URL_GEN',
        transport: Transport.GRPC,
        options: {
          package: 'shorturl',
          protoPath: existsSync(shortUrlProtoPath)
            ? shortUrlProtoPath
            : join(sharedProtoDir, 'shorturl.proto'),
        },
      },
    ]),
  ],
})
export class ShortUrlModule {}
