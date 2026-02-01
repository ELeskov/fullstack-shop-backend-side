import { ApiProperty } from '@nestjs/swagger'

export class SendVerificationEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email для отправки токена верификации',
  })
  email!: string
}
