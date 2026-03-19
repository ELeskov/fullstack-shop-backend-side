import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'

@Injectable()
export class BasketService {
  constructor(private readonly prismaService: PrismaService) {}

  public async addProductToBasket(userId: string, productId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { basket: true },
    })

    if (!user || !user.basket) {
      throw new NotFoundException('Пользователь или корзина не найден')
    }

    return this.prismaService.basketItem.upsert({
      where: {
        basketId_productId: {
          basketId: user.basket.id,
          productId,
        },
      },
      update: {
        quantity: { increment: 1 },
      },
      create: {
        basketId: user.basket.id,
        productId,
      },
      include: { product: true },
    })
  }

  public async getBasketByUserId(userId: string) {
    return this.prismaService.basket.findUnique({
      where: { userId },
      include: {
        basketItems: {
          include: {
            product: {
              include: {
                category: {
                  select: {
                    title: true,
                  },
                },
                color: {
                  select: {
                    title: true,
                    value: true,
                  },
                },
              },
            },
          },
        },
      },
    })
  }

  public async getQuantityByProductId(userId: string, productId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { basket: true },
    })

    if (!user || !user.basket) {
      return null
    }

    const basketItem = await this.prismaService.basketItem.findUnique({
      where: {
        basketId_productId: {
          basketId: user.basket.id,
          productId,
        },
      },
      select: {
        quantity: true,
      },
    })

    if (!basketItem) {
      return { quantity: 0 }
    }

    return basketItem
  }

  public async deleteProductFromBasket(userId: string, productId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { basket: true },
    })

    if (!user || !user.basket) {
      throw new NotFoundException('Пользователь или корзина не найден')
    }

    await this.prismaService.basketItem.delete({
      where: {
        basketId_productId: {
          productId,
          basketId: user.basket.id,
        },
      },
    })

    return true
  }

  public async decrementProductQuantity(userId: string, productId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { basket: true },
    })

    const result = await this.prismaService.$transaction(async tx => {
      if (!user || !user.basket) {
        throw new NotFoundException('Корзина не найдена')
      }

      const updatedItem = await tx.basketItem.update({
        where: {
          basketId_productId: {
            basketId: user.basket.id,
            productId,
          },
        },
        data: {
          quantity: {
            decrement: 1,
          },
        },
        include: { product: true },
      })

      if (updatedItem.quantity <= 0) {
        await tx.basketItem.delete({
          where: {
            basketId_productId: {
              basketId: user.basket.id,
              productId,
            },
          },
        })
        return { success: true, deleted: true }
      }

      return {
        success: true,
        item: updatedItem,
        deleted: false,
      }
    })

    return result
  }
}
