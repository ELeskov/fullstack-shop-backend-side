import { ApiProperty } from '@nestjs/swagger'

export class ColorResponseDto {
  @ApiProperty({ example: 'a0d3d0d9-1b4f-4fb8-9c3c-4f0f5d2d8a32' })
  id!: string

  @ApiProperty({ example: 'Белый' })
  title!: string

  @ApiProperty({ example: '#FFFFFF' })
  value!: string

  @ApiProperty({ example: 'c8cbd1a7-7d9c-4c6f-8b2c-4db6c7d1a0aa' })
  shopId!: string

  @ApiProperty({ example: '2026-02-19T12:00:00.000Z' })
  createdAt!: string
}
