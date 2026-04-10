import { ApiProperty } from '@nestjs/swagger'

import { OrderColorResponseDto } from './order-color-response.dto'

export class OrderProductResponseDto {
  @ApiProperty({
    description: 'ID товара',
    example: '44f9ec10-2f2d-4fe3-a5aa-c4f6f67f1111',
  })
  id!: string

  @ApiProperty({
    description: 'Название товара',
    example: 'Футболка Oversize',
  })
  title!: string

  @ApiProperty({
    description: 'Описание товара',
    example: 'Хлопковая футболка свободного кроя',
  })
  description!: string

  @ApiProperty({
    description: 'Цена товара',
    example: 2500,
  })
  price!: number

  @ApiProperty({
    description: 'Массив изображений товара',
    example: [
      'https://example.com/images/product-1.jpg',
      'https://example.com/images/product-2.jpg',
    ],
    type: [String],
  })
  images!: string[]

  @ApiProperty({
    description: 'ID магазина',
    example: 'd8494a2f-06e9-486c-9c14-c1ed3d7a1111',
  })
  shopId!: string

  @ApiProperty({
    description: 'ID категории товара',
    example: 'c3f24fb4-9677-4f08-a6c7-9e18d5d21111',
  })
  categoryId!: string

  @ApiProperty({
    description: 'ID цвета товара',
    example: '3f7df2e0-4c37-4a19-b6bb-5bb1b7f0c321',
    nullable: true,
  })
  colorId!: string | null

  @ApiProperty({
    description: 'Дата создания товара',
    example: '2026-04-06T10:00:00.000Z',
  })
  createdAt!: Date

  @ApiProperty({
    description: 'Дата обновления товара',
    example: '2026-04-06T10:00:00.000Z',
  })
  updatedAt!: Date

  @ApiProperty({
    description: 'Цвет товара',
    type: OrderColorResponseDto,
    nullable: true,
  })
  color!: OrderColorResponseDto | null
}
