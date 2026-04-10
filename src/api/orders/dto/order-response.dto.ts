import { ApiProperty } from '@nestjs/swagger'
import { EnumOrderStatus } from '@prisma/generated/client'

import { OrderItemResponseDto } from './order-item-response.dto'

export class OrderResponseDto {
  @ApiProperty({
    description: 'ID заказа',
    example: 'e6de9db5-29bc-4708-8cc5-c6d7d7d31111',
  })
  id!: string

  @ApiProperty({
    description: 'Статус заказа',
    enum: EnumOrderStatus,
    example: EnumOrderStatus.PENDING,
  })
  orderStatus!: EnumOrderStatus

  @ApiProperty({
    description: 'Общая сумма заказа',
    example: 5000,
  })
  total!: number

  @ApiProperty({
    description: 'Дата создания заказа',
    example: '2026-04-06T10:00:00.000Z',
  })
  createdAt!: Date

  @ApiProperty({
    description: 'Список товаров в заказе',
    type: [OrderItemResponseDto],
  })
  products!: OrderItemResponseDto[]
}
