import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest, UserContextDto } from '../dtos/user-context.dto';

export const UserContext = createParamDecorator(
  <K extends keyof UserContextDto>(
    data: K | undefined,
    ctx: ExecutionContext,
  ): UserContextDto[K] | UserContextDto | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
