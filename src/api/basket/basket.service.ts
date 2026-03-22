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
          orderBy: { createdAt: 'desc' },

          include: {
            product: {
              include: {
                color: {
                  select: {
                    title: true,
                    value: true,
                  },
                },
              },
              omit: {
                shopId: true,
                colorId: true,
                categoryId: true,
                createdAt: true,
                updatedAt: true,
                description: true,
              },
            },
          },

          omit: {
            basketId: true,
            productId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },

      omit: {
        userId: true,
        createdAt: true,
        updatedAt: true,
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

  public async changeSelectedStatus(
    userId: string,
    productId: string,
    newStatus?: boolean,
  ) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { basket: true },
    })

    if (!user || !user.basket) {
      throw new NotFoundException('Пользователь или корзина не найдены')
    }

    const existingItem = await this.prismaService.basketItem.findUnique({
      where: {
        basketId_productId: {
          basketId: user.basket.id,
          productId,
        },
      },
      select: { isSelected: true },
    })

    if (!existingItem) {
      throw new NotFoundException('Товар не найден в корзине')
    }

    const isSelected =
      newStatus !== undefined ? newStatus : !existingItem.isSelected

    const basketItem = await this.prismaService.basketItem.update({
      where: {
        basketId_productId: {
          basketId: user.basket.id,
          productId,
        },
      },
      data: {
        isSelected,
      },
      include: {
        product: true,
      },
    })

    return basketItem
  }

  public async toggleSelectAllItems(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { basket: true },
    })

    if (!user || !user.basket) {
      throw new NotFoundException('Пользователь или корзина не найдены')
    }

    const basketItems = await this.prismaService.basketItem.findMany({
      where: { basketId: user.basket.id },
      select: { isSelected: true },
    })

    if (basketItems.length === 0) {
      throw new NotFoundException('Корзина пуста')
    }

    const allSelected = basketItems.every(item => item.isSelected)
    const newStatus = !allSelected

    await this.prismaService.basketItem.updateMany({
      where: { basketId: user.basket.id },
      data: { isSelected: newStatus },
    })

    return this.getBasketByUserId(userId)
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
