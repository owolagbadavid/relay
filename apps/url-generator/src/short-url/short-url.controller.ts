import { Controller } from '@nestjs/common';
import { ShortUrlService } from './short-url.service';

@Controller()
export class ShortUrlController {
  constructor(private readonly shortUrlService: ShortUrlService) {}
}
