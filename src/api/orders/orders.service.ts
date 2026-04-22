import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from '@prisma/generated/client'

import { GetOrdersQueryDto } from '@/api/orders/dto/get-orders-query.dto'
import { YookassaWebhookDto } from '@/api/orders/types/webhookbody.type'
import { ProductService } from '@/api/product/product.service'
import { YoomoneyService } from '@/api/providers/yoomoney/yoomoney.service'
import { PrismaService } from '@/infra/prisma/prisma.service'

@Injectable()
export class OrdersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly yoomoneyService: YoomoneyService,
    private readonly productsService: ProductService,
  ) {}

  public async create(userId: string) {
    return this.prismaService.$transaction(async tx => {
      const userBasket = await tx.basket.findUnique({
        where: {
          userId,
        },
        include: {
          basketItems: {
            where: {
              isSelected: true,
            },
            select: {
              id: true,
              quantity: true,
              product: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  color: true,
                  images: true,
                  shopId: true,
                },
              },
            },
          },
        },
      })

      if (!userBasket) {
        throw new NotFoundException('Корзина пользователя не найдена')
      }

      if (userBasket.basketItems.length === 0) {
        throw new BadRequestException('Корзина пуста')
      }

      const totalAmount = userBasket.basketItems.reduce((sum, item) => {
        return sum + item.product.price * item.quantity
      }, 0)

      const orderItems = userBasket.basketItems.map(item => ({
        quantity: item.quantity,
        price: item.product.price,
        productId: item.product.id,
        shopId: item.product.shopId ?? null,
      }))

      await tx.order.create({
        data: {
          userId,
          totalAmount,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      })

      await tx.basketItem.deleteMany({
        where: {
          basketId: userBasket.id,
          isSelected: true,
        },
      })

      return true
    })
  }

  public async getByUserId(userId: string, query?: GetOrdersQueryDto) {
    const orders = await this.prismaService.order.findMany({
      where: {
        userId,
        ...(query?.status ? { status: query.status } : {}),
      },
      include: {
        items: {
          select: {
            quantity: true,
            product: {
              include: {
                color: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: query?.sortByCreatedAt ?? 'desc',
      },
    })

    return orders.map(order => ({
      id: order.id,
      orderStatus: order.status,
      total: order.totalAmount,
      createdAt: order.createdAt,
      products: order.items,
    }))
  }

  public async getById(userId: string, orderId: string) {
    const order = await this.prismaService.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          select: {
            quantity: true,
            product: {
              include: {
                color: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      throw new NotFoundException('Заказ не найден')
    }

    return {
      id: order.id,
      orderStatus: order.status,
      total: order.totalAmount,
      createdAt: order.createdAt,
      products: order.items,
    }
  }

  public async payOrder(userId: string, orderId: string) {
    const order = await this.prismaService.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      select: {
        id: true,
        userId: true,
        status: true,
        totalAmount: true,
      },
    })

    if (!order) {
      throw new NotFoundException('Заказ не найден')
    }

    if (order.status === 'PAYED') {
      throw new BadRequestException('Заказ уже оплачен')
    }

    if (order.status === 'CANCELED') {
      throw new BadRequestException('Нельзя оплатить отменённый заказ')
    }

    if (order.totalAmount <= 0) {
      throw new BadRequestException('Сумма заказа должна быть больше 0')
    }

    const returnUrl = process.env.ALLOWED_ORIGIN

    if (!returnUrl) {
      throw new InternalServerErrorException(
        'Не настроен returnUrl для YooKassa',
      )
    }

    const payment = await this.yoomoneyService.createPayment({
      amount: order.totalAmount,
      orderId: order.id,
      userId: order.userId,
      returnUrl,
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

    await this.prismaService.order.update({
      where: {
        id: order.id,
      },
      data: {
        paymentId: payment.id,
        status: 'PAYMENT_PENDING',
      },
    })

    return {
      paymentId: payment.id,
      status: payment.status,
      confirmationUrl,
    }
  }

  public async handleWebhook(body: YookassaWebhookDto) {
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

    const payment = await this.yoomoneyService.getPayment(paymentId)

    if (payment.status !== 'succeeded') {
      return { received: true }
    }

    const orderIdFromMetadata = this.extractOrderIdFromPaymentMetadata(
      payment.metadata,
    )

    type OrderWithItemsAndProduct = Prisma.OrderGetPayload<{
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    }>

    let order: OrderWithItemsAndProduct | null = null

    if (orderIdFromMetadata) {
      order = await this.prismaService.order.findUnique({
        where: {
          id: orderIdFromMetadata,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })
    }

    if (!order) {
      order = await this.prismaService.order.findFirst({
        where: {
          paymentId: payment.id,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })
    }

    if (!order) {
      throw new NotFoundException('Заказ для платежа не найден')
    }

    if (order.status === 'PAYED') {
      return { received: true }
    }

    await this.prismaService.$transaction(async tx => {
      await tx.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: 'PAYED',
        },
      })
    })

    for (const item of order.items) {
      if (!item.productId) {
        continue
      }

      await this.productsService.incrementPurchasesCount(
        item.productId,
        item.quantity,
      )
    }

    return { received: true }
  }

  private extractOrderIdFromPaymentMetadata(metadata: unknown): string | null {
    if (
      typeof metadata === 'object' &&
      metadata !== null &&
      'orderId' in metadata &&
      typeof metadata.orderId === 'string'
    ) {
      return metadata.orderId
    }

    return null
  }
}
