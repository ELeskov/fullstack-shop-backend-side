import { YooCheckout } from '@a2seven/yoo-checkout'
import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'crypto'

import { AllConfigs } from '@/config/definitions/all.configs'

@Injectable()
export class YoomoneyService {
  private readonly checkout: YooCheckout

  constructor(private readonly configService: ConfigService<AllConfigs>) {
    const shopId = this.configService.get<string>('yookassa.shopId', {
      infer: true,
    })
    const secretKey = this.configService.get<string>('yookassa.secretKey', {
      infer: true,
    })

    if (!shopId || !secretKey) {
      throw new Error('YooKassa credentials are not configured')
    }

    this.checkout = new YooCheckout({
      shopId,
      secretKey,
    })
  }

  public async createPayment(params: {
    amount: number
    orderId: string
    userId: string
    returnUrl: string
  }) {
    try {
      return await this.checkout.createPayment(
        {
          amount: {
            value: params.amount.toFixed(2),
            currency: 'RUB',
          },
          capture: true,
          confirmation: {
            type: 'redirect',
            return_url: params.returnUrl,
          },
          description: `Оплата заказа #${params.orderId.slice(0, 8)}`,
          metadata: {
            orderId: params.orderId,
            userId: params.userId,
          },
        },
        randomUUID(),
      )
    } catch {
      throw new InternalServerErrorException(
        'Не удалось создать платеж в YooKassa',
      )
    }
  }

  public async getPayment(paymentId: string) {
    try {
      return await this.checkout.getPayment(paymentId)
    } catch {
      throw new InternalServerErrorException(
        'Не удалось получить данные платежа из YooKassa',
      )
    }
  }
}