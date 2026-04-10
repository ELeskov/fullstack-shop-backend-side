import { ApiProperty } from '@nestjs/swagger'

export class OrderColorResponseDto {
  @ApiProperty({
    description: 'ID цвета',
    example: '3f7df2e0-4c37-4a19-b6bb-5bb1b7f0c321',
  })
  id!: string

  @ApiProperty({
    description: 'Название цвета',
    example: 'Красный',
  })
  title!: string

  @ApiProperty({
    description: 'Значение цвета в HEX',
    example: '#FF0000',
  })
  value!: string

  @ApiProperty({
    description: 'ID магазина, которому принадлежит цвет',
    example: 'f3a7dc57-8191-49d2-9f3e-baf53a6980c7',
  })
  shopId!: string

  @ApiProperty({
    description: 'Дата создания цвета',
    example: '2026-04-06T10:00:00.000Z',
  })
  createdAt!: Date

  @ApiProperty({
    description: 'Дата обновления цвета',
    example: '2026-04-06T10:00:00.000Z',
  })
  updatedAt!: Date
}
