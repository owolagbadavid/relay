import { Controller, Get } from '@nestjs/common';
import { UrlGeneratorService } from './url-generator.service';

@Controller()
export class UrlGeneratorController {
  constructor(private readonly urlGeneratorService: UrlGeneratorService) {}

  @Get()
  getHello(): string {
    return this.urlGeneratorService.getHello();
  }
}
