import { RMQ, URL_GEN } from '@lib/shared/tokens';
import { Inject, Injectable } from '@nestjs/common';
import type { ClientGrpc, ClientRMQ } from '@nestjs/microservices';

@Injectable()
export class ShortUrlService {
  constructor(
    @Inject(URL_GEN) private urlGenClient: ClientGrpc,
    @Inject(RMQ) private rmqClient: ClientRMQ,
  ) {}
}
