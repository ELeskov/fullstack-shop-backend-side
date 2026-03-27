import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'

@Injectable()
export class FavoritesService {
  constructor(private prismaService: PrismaService) {}

  async findByUser(userId: string) {
    return this.prismaService.favorites.findUnique({
      where: { userId },
      include: {
        favoritesItems: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                images: true,
                shop: {
                  select: {
                    title: true,
                  },
                },
                color: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    })
  }

  async addToFavorites(userId: string, productId: string) {
    let favorites = await this.prismaService.favorites.upsert({
      where: { userId },
      update: {},
      create: { userId },
    })

    const exists = await this.prismaService.favoritesItem.findUnique({
      where: {
        favoritesId_productId: {
          favoritesId: favorites.id,
          productId,
        },
      },
    })

    if (exists) {
      throw new ConflictException('Товар уже добавлен в избранное')
    }

    favorites = await this.prismaService.favorites.update({
      where: { id: favorites.id },
      data: {
        favoritesItems: {
          create: { productId },
        },
      },
      include: {
        favoritesItems: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
    })

    return true
  }

  async removeFromFavorites(userId: string, productId: string) {
    const favorites = await this.prismaService.favorites.findUnique({
      where: { userId },
    })

    if (!favorites) {
      throw new NotFoundException('Избранный товар не найден')
    }

    await this.prismaService.favoritesItem.delete({
      where: {
        favoritesId_productId: {
          favoritesId: favorites.id,
          productId,
        },
      },
    })

    return true
  }
}
