import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Validate,
} from 'class-validator'

import { IsPasswordsMatchingConstraint } from '@/shared/decorators/is-passwords-matching-constraint.decorator'

/**
 * DTO для регистрации пользователя.
 */
export class RegisterDto {
  /**
   * Имя пользователя.
   *
   * @example John Doe
   */
  @ApiProperty({
    example: 'John Doe',
    description: 'Имя пользователя, отображаемое в системе.',
  })
  @IsString({ message: 'Имя должно быть строкой.' })
  @IsNotEmpty({ message: 'Имя обязательно для заполнения.' })
  name!: string

  /**
   * Email пользователя.
   *
   * @example example@example.com
   */
  @ApiProperty({
    example: 'example@example.com',
    description:
      'Уникальный email пользователя. Используется для регистрации и входа.',
  })
  @IsString({ message: 'Email должен быть строкой.' })
  @IsEmail({}, { message: 'Некорректный формат email.' })
  @IsNotEmpty({ message: 'Email обязателен для заполнения.' })
  email!: string

  /**
   * Пароль пользователя.
   *
   * @example password123
   */
  @ApiProperty({
    example: 'password123',
    description:
      'Пароль пользователя. Минимальная длина — 6 символов (валидация на бэкенде).',
    minLength: 6,
  })
  @IsString({ message: 'Пароль должен быть строкой.' })
  @IsNotEmpty({ message: 'Пароль обязателен для заполнения.' })
  @MinLength(6, {
    message: 'Пароль должен содержать минимум 6 символов.',
  })
  password!: string

  /**
   * Подтверждение пароля пользователя.
   * Должно совпадать с полем `password`.
   *
   * @example password123
   */
  @ApiProperty({
    example: 'password123',
    description:
      'Подтверждение пароля. Должно совпадать с полем "password". ' +
      'Проверяется кастомным валидатором IsPasswordsMatchingConstraint.',
    minLength: 6,
  })
  @IsString({ message: 'Пароль подтверждения должен быть строкой.' })
  @IsNotEmpty({ message: 'Поле подтверждения пароля не может быть пустым.' })
  @MinLength(6, {
    message: 'Пароль подтверждения должен содержать не менее 6 символов.',
  })
  @Validate(IsPasswordsMatchingConstraint, {
    message: 'Пароли не совпадают.',
  })
  passwordRepeat!: string
}
