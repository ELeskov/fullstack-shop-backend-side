import { ApiProperty } from '@nestjs/swagger'

export class HttpErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number

  @ApiProperty({ example: 'Bad Request' })
  error!: string

  @ApiProperty({ example: 'Неверные учетные данные' })
  message!: string
}

export class BadRequestErrorDto extends HttpErrorResponseDto {
  @ApiProperty({ example: 400 })
  declare statusCode: 400

  @ApiProperty({ example: 'Bad Request' })
  declare error: 'Bad Request'
}

export class UnauthorizedErrorDto extends HttpErrorResponseDto {
  @ApiProperty({ example: 401 })
  declare statusCode: 401

  @ApiProperty({ example: 'Unauthorized' })
  declare error: 'Unauthorized'
}

export class NotFoundErrorDto extends HttpErrorResponseDto {
  @ApiProperty({ example: 404 })
  declare statusCode: 404

  @ApiProperty({ example: 'Not Found' })
  declare error: 'Not Found'
}

export class ConflictErrorDto extends HttpErrorResponseDto {
  @ApiProperty({ example: 409 })
  declare statusCode: 409

  @ApiProperty({ example: 'Conflict' })
  declare error: 'Conflict'
}

export class ForbiddenErrorDto extends HttpErrorResponseDto {
  @ApiProperty({ example: 403 })
  declare statusCode: 403

  @ApiProperty({ example: 'Недостаточно прав (требуется роль ADMIN).' })
  declare error: 'Forbidden'
}
