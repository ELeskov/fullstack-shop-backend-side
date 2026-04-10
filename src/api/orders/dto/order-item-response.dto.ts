import { ApiProperty } from '@nestjs/swagger'

import { OrderProductResponseDto } from './order-product-response.dto'

export class OrderItemResponseDto {
  @ApiProperty({
    description: 'Количество товара в заказе',
    example: 2,
  })
  quantity!: number

  @ApiProperty({
    description: 'Товар в заказе',
    type: OrderProductResponseDto,
    nullable: true,
  })
  product!: OrderProductResponseDto | null
}
