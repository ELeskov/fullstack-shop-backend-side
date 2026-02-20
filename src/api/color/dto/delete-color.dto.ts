import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export class DeleteColorDto {
  @ApiProperty({
    example: '5f3adf09-7d49-4d6c-8e07-2ce0bb8b0c8e',
    description: 'ID магазина',
  })
  @IsUUID()
  shopId!: string

  @ApiProperty({
    example: 'a0d3d0d9-1b4f-4fb8-9c3c-4f0f5d2d8a32',
    description: 'ID цвета',
  })
  @IsUUID()
  colorId!: string
}
