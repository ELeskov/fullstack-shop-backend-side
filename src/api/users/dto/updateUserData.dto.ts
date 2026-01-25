import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class UpdateUserDataDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Имя пользователя, отображаемое в системе.',
  })
  @IsString({ message: 'Имя должно быть строкой.' })
  @IsNotEmpty({ message: 'Имя обязательно для заполнения.' })
  firstName!: string

  @ApiProperty({
    example: 'example@example.com',
    description: 'Email пользователя. Используется как логин при авторизации.',
  })
  @IsString({ message: 'Email должен быть строкой.' })
  @IsEmail({}, { message: 'Некорректный формат email.' })
  @IsNotEmpty({ message: 'Email обязателен для заполнения.' })
  newEmail!: string
}
