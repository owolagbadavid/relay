import { Inject, Injectable } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class ShortUrlService {
  constructor(@Inject('URL_GEN') private urlGenClient: ClientGrpc) {}
}
