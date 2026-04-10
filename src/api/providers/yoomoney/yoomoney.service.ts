import { YooCheckout } from '@a2seven/yoo-checkout'
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Order } from '@prisma/generated/client'
import { randomUUID } from 'crypto'

import { AllConfigs } from '@/config/definitions/all.configs'
import { PrismaService } from '@/infra/prisma/prisma.service'

type YookassaWebhookBody = {
  type: 'notification'
  event:
    | 'payment.succeeded'
    | 'payment.waiting_for_capture'
    | 'payment.canceled'
  object: {
    id: string
    status: string
    paid?: boolean
    metadata?: {
      orderId?: string
      userId?: string
    }
    amount?: {
      value: string
      currency: string
    }
  }
}

@Injectable()
export class YoomoneyService {
  private readonly checkout: YooCheckout

  constructor(
    private readonly configService: ConfigService<AllConfigs>,
    private readonly prismaService: PrismaService,
  ) {
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

  public async create(orderId: string, userId: string) {
    const order = await this.prismaService.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
    })

    if (!order) {
      throw new NotFoundException('Заказ не найден')
    }

    if (order.status === 'PAYED') {
      throw new BadRequestException('Заказ уже оплачен')
    }

    if (order.totalAmount <= 0) {
      throw new BadRequestException('Сумма заказа должна быть больше 0')
    }

    const returnUrl = this.configService.get<string>('app.allowedOrigin', {
      infer: true,
    })

    if (!returnUrl) {
      throw new InternalServerErrorException(
        'Не настроен returnUrl для YooKassa',
      )
    }

    const idempotenceKey = randomUUID()

    try {
      const payment = await this.checkout.createPayment(
        {
          amount: {
            value: order.totalAmount.toFixed(2),
            currency: 'RUB',
          },
          capture: true,
          confirmation: {
            type: 'redirect',
            return_url: returnUrl,
          },
          description: `Оплата заказа #${order.id.slice(0, 8)}`,
          metadata: {
            orderId: order.id,
            userId: order.userId,
          },
        },
        idempotenceKey,
      )

      await this.prismaService.order.update({
        where: {
          id: order.id,
        },
        data: {
          paymentId: payment.id,
        },
      })

      const confirmationUrl =
        payment.confirmation &&
        'confirmation_url' in payment.confirmation &&
        payment.confirmation.confirmation_url
          ? payment.confirmation.confirmation_url
          : null

      if (!confirmationUrl) {
        throw new InternalServerErrorException(
          'ЮKassa не вернула ссылку на оплату',
        )
      }

      return {
        paymentId: payment.id,
        status: payment.status,
        confirmationUrl,
      }
    } catch {
      throw new InternalServerErrorException(
        'Не удалось создать платеж в YooKassa',
      )
    }
  }

  public async handleWebhook(body: YookassaWebhookBody) {
    if (body.type !== 'notification') {
      throw new BadRequestException('Некорректный тип webhook')
    }

    if (body.event !== 'payment.succeeded') {
      return { received: true }
    }

    const paymentId = body.object?.id
    if (!paymentId) {
      throw new BadRequestException('Отсутствует payment id')
    }

    const payment = await this.checkout.getPayment(paymentId)

    if (payment.status !== 'succeeded') {
      return { received: true }
    }

    const rawMetadata: unknown = payment.metadata

    const orderIdFromMetadata =
      typeof rawMetadata === 'object' &&
      rawMetadata !== null &&
      'orderId' in rawMetadata &&
      typeof rawMetadata.orderId === 'string'
        ? rawMetadata.orderId
        : null

    let order: Order | null = null

    if (orderIdFromMetadata) {
      order = await this.prismaService.order.findUnique({
        where: {
          id: orderIdFromMetadata,
        },
      })
    }

    if (!order) {
      order = await this.prismaService.order.findFirst({
        where: {
          paymentId: payment.id,
        },
      })
    }

    if (!order) {
      throw new NotFoundException('Заказ для платежа не найден')
    }

    if (order.status === 'PAYED') {
      return { received: true }
    }

    await this.prismaService.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: 'PAYED',
      },
    })

    return { received: true }
  }
}
