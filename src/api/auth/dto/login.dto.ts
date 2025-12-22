import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'

/**
 * DTO для входа пользователя в систему.
 */
export class LoginDto {
  /**
   * Email пользователя.
   * Используется как идентификатор при входе.
   *
   * @example example@example.com
   */
  @ApiProperty({
    example: 'example@example.com',
    description: 'Email пользователя. Используется как логин при авторизации.',
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
  @IsNotEmpty({ message: 'Поле пароль не может быть пустым.' })
  @MinLength(6, { message: 'Пароль должен содержать не менее 6 символов.' })
  password!: string

  /**
   * Код двухфакторной аутентификации (необязательно).
   * Если включена 2FA, код обязателен для успешного входа.
   *
   * @example 123456
   */
  @ApiPropertyOptional({
    example: '123456',
    description:
      'Код двухфакторной аутентификации. Обязателен только при включённой 2FA.',
  })
  @IsOptional()
  @IsString({
    message: 'Код двухфакторной аутентификации должен быть строкой.',
  })
  code?: string
}
