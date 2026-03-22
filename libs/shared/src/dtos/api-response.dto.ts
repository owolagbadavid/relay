import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = undefined> {
  constructor(data?: T, message: string = '') {
    this.data = data;
    this.message = message;
  }

  @ApiProperty()
  public data?: T;

  @ApiProperty()
  public message: string;
}

export class ResponseHelper {
  static successNoData(message: string = 'Success'): ApiResponseDto {
    return this.success(undefined, message);
  }

  static success<T>(data?: T, message: string = 'Success'): ApiResponseDto<T> {
    return new ApiResponseDto<T>(data, message);
  }

  static error<T>(message: string = 'Error'): ApiResponseDto<T> {
    return new ApiResponseDto<T>(undefined, message);
  }
}
