import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export enum ApiErrorCode {
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL = 'INTERNAL',
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number

  @ApiProperty({ example: 'Bad Request' })
  error!: string

  @ApiProperty({ example: 'Неверные учетные данные' })
  message!: string

  @ApiProperty({ enum: ApiErrorCode, example: ApiErrorCode.UNAUTHORIZED })
  code!: ApiErrorCode

  @ApiPropertyOptional({
    example: { email: ['Invalid email'] },
    description: 'Ошибки по полям (обычно из ValidationPipe)',
  })
  details?: Record<string, string[]>

  @ApiProperty({
    example: '/api/account/login',
    description: 'Путь запроса (для отладки)',
  })
  path!: string

  @ApiProperty({
    example: '2026-02-13T11:32:54.861Z',
    description: 'ISO timestamp (для отладки)',
  })
  timestamp!: string
}
