import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiExtraModels, getSchemaPath, ApiResponse } from '@nestjs/swagger';
import { ApiResponseDto } from '../dtos/api-response.dto';
import { PagedResultDto } from '../dtos/paged-result.dto';

export const ApiDataResponse = <TModel extends Type<any>>(
  model: TModel,
  status: HttpStatus = HttpStatus.OK,
) =>
  applyDecorators(
    ApiExtraModels(ApiResponseDto, model),
    ApiResponse({
      status,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  );

export const ApiPaginatedDataResponse = <TModel extends Type<any>>(
  model: TModel,
  status: HttpStatus = HttpStatus.OK,
) =>
  applyDecorators(
    ApiExtraModels(ApiResponseDto, model, PagedResultDto),
    ApiResponse({
      status,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              data: {
                allOf: [
                  { $ref: getSchemaPath(PagedResultDto) },
                  {
                    properties: {
                      items: {
                        type: 'array',
                        items: { $ref: getSchemaPath(model) },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    }),
  );
