import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class ShopResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  title!: string

  @ApiProperty()
  description!: string

  @ApiProperty({ required: false })
  @IsOptional()
  picture?: string

  @ApiProperty()
  @IsOptional()
  userId!: string

  @ApiProperty()
  createdAt!: string

  @ApiProperty()
  updatedAt!: string
}
