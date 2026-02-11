import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CreateShopResponseDto {
  @ApiProperty({
    example: '12hv12d121c1-d1351jhk1bh2i1d-dfiygdf6y8dgaf8',
    description: 'Id магазина',
  })
  @IsString()
  shopId!: string
}
