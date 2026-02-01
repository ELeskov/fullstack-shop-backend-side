import { ApiProperty } from '@nestjs/swagger'

export class AccountResponseDto {
  @ApiProperty({
    example: '12hv12d121c1-d1351jhk1bh2i1d-dfiygdf6y8dgaf8',
    description: 'id пользователя',
  })
  userId!: string
}
