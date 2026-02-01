import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class VerificationTokenDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Токен подтверждения из письма',
  })
  @IsString({ message: 'Токен должен быть строкой.' })
  @IsNotEmpty({ message: 'Поле токен не может быть пустым.' })
  token!: string
}
