import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator'

/**
 * DTO для сброса пароля по токену.
 */
export class ResetPasswordDto {
  /**
   * Уникальный токен для сброса пароля.
   * Приходит на email пользователя.
   *
   * @example "550e8400-e29b-41d4-a716-446655440001"
   */
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Токен для сброса пароля из письма.',
  })
  @IsString({ message: 'Токен должен быть строкой.' })
  @IsUUID('all', { message: 'Некорректный формат токена.' })
  @IsNotEmpty({ message: 'Токен обязателен для сброса пароля.' })
  token!: string

  /**
   * Новый пароль пользователя.
   *
   * @example newPassword123
   */
  @ApiProperty({
    example: 'newPassword123',
    description: 'Новый пароль. Минимальная длина — 6 символов.',
    minLength: 6,
  })
  @IsString({ message: 'Пароль должен быть строкой.' })
  @IsNotEmpty({ message: 'Поле пароль не может быть пустым.' })
  @MinLength(6, { message: 'Пароль должен содержать не менее 6 символов.' })
  password!: string

  /**
   * Подтверждение нового пароля.
   *
   * @example newPassword123
   */
  @ApiProperty({
    example: 'newPassword123',
    description: 'Подтверждение нового пароля (должно совпадать с паролем).',
    minLength: 6,
  })
  @IsString({ message: 'Подтверждение пароля должно быть строкой.' })
  @IsNotEmpty({ message: 'Подтверждение пароля обязательно.' })
  @MinLength(6, {
    message: 'Подтверждение пароля должно содержать не менее 6 символов.',
  })
  confirmPassword!: string
}
