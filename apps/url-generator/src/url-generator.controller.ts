import { Controller, Get } from '@nestjs/common';
// import { GrpcMethod, RpcException } from '@nestjs/microservices';
// import type { Metadata, ServerUnaryCall } from '@grpc/grpc-js';
import { UrlGeneratorService } from './url-generator.service';

@Controller()
export class UrlGeneratorController {
  constructor(private readonly urlGeneratorService: UrlGeneratorService) {}

  @Get()
  getHello(): string {
    return this.urlGeneratorService.getHello();
  }

  // @GrpcMethod('HeroesService', 'FindOne')
  // findOne(
  //   data: HeroById,
  //   metadata: Metadata,
  //   call: ServerUnaryCall<any, any>,
  // ): Hero {
  //   const items = [
  //     { id: 1, name: 'John' },
  //     { id: 2, name: 'Doe' },
  //   ];
  //   const item = items.find(({ id }) => id === data.id);

  //   if (!item) {
  //     throw new RpcException({
  //       code: status.NOT_FOUND,
  //       message: `Hero ${data.id} not found`,
  //     });
  //   }

  //   return item;
  // }
}
