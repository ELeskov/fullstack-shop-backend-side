import { ApiProperty } from '@nestjs/swagger'

export class PayOrderResponseDto {
  @ApiProperty({
    description: 'ID платежа в YooKassa',
    example: '2419a771-000f-5000-9000-1edaf29243f2',
  })
  paymentId!: string

  @ApiProperty({
    description: 'Статус платежа в YooKassa',
    example: 'pending',
  })
  status!: string

  @ApiProperty({
    description: 'Ссылка для перехода на страницу оплаты',
    example: 'https://yoomoney.ru/checkout/payments/v2/contract?...',
  })
  confirmationUrl!: string
}
