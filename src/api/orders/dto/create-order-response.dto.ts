import { ApiProperty } from '@nestjs/swagger'

export class CreateOrderResponseDto {
  @ApiProperty({
    description: 'Результат успешного создания заказа',
    example: true,
  })
  success!: boolean
}
