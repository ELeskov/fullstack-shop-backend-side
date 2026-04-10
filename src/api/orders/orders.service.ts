import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { GetOrdersQueryDto } from '@/api/orders/dto/get-orders-query.dto'
import { YoomoneyService } from '@/api/providers/yoomoney/yoomoney.service'
import { PrismaService } from '@/infra/prisma/prisma.service'

@Injectable()
export class OrdersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly yoomoneyService: YoomoneyService,
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
    return this.yoomoneyService.create(orderId, userId)
  }
} 
