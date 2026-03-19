import { ApiProperty } from '@nestjs/swagger'

export class GetQuantityByProductIdResponseDto {
  @ApiProperty({ example: '4' })
  quantity!: number
}
