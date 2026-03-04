import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class AdminUpdateUserDto {
  @ApiPropertyOptional({
    description: 'Новое имя пользователя',
    example: 'Иван',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Имя должно быть не короче 2 символов' })
  name?: string

  @ApiPropertyOptional({
    description: 'Новый email',
    example: 'new@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Некорректный email' })
  email?: string

  @ApiPropertyOptional({
    description:
      'Ссылка на новую аватарку. Передайте пустую строку, чтобы удалить текущую.',
    example: '',
  })
  @IsOptional()
  @IsString()
  picture?: string
}
