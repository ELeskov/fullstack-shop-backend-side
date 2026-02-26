import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class SendEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email для отправки токена верификации',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string
}
