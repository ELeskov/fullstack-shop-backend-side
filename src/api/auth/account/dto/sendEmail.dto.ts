import { ApiProperty } from '@nestjs/swagger'

export class SendEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email для отправки токена верификации',
  })
  email!: string
}
