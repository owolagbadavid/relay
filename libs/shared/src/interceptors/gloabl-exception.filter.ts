import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseHelper } from '../dtos/api-response.dto';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      if (exception.getStatus() === Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
        Logger.error('Unhandled exception:', exception);
      } else {
        status = exception.getStatus();
        const resBody = exception.getResponse();
        message =
          typeof resBody === 'string'
            ? resBody
            : (resBody as { message?: string })?.message ||
              (resBody as { error?: string })?.error ||
              message;
      }
    }

    const responseBody = ResponseHelper.error(message);

    res.status(status).json(responseBody);
  }
}
