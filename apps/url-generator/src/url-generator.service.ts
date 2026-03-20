import { Injectable } from '@nestjs/common';

@Injectable()
export class UrlGeneratorService {
  getHello(): string {
    return 'Hello World!';
  }
}
