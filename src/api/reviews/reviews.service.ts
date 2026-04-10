import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'

import { CreateReviewDto } from './dto/create-review.dto'

@Injectable()
export class ReviewsService {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(userId: string, dto: CreateReviewDto) {
    const product = await this.prismaService.product.findUnique({
      where: {
        id: dto.productId,
      },
      select: {
        id: true,
        shopId: true,
      },
    })

    if (!product) {
      throw new NotFoundException('Товар не найден')
    }

    if (product.shopId !== dto.shopId) {
      throw new BadRequestException(
        'Магазин товара не совпадает с shopId в отзыве',
      )
    }

    const order = await this.prismaService.order.findFirst({
      where: {
        userId,
        status: 'PAYED',
        items: {
          some: {
            productId: dto.productId,
            shopId: dto.shopId,
          },
        },
      },
      select: {
        id: true,
      },
    })

    if (!order) {
      throw new BadRequestException(
        'Оставить отзыв можно только на оплаченный купленный товар',
      )
    }

    const existingReview = await this.prismaService.review.findFirst({
      where: {
        userId,
        productId: dto.productId,
        shopId: dto.shopId,
      },
    })

    if (existingReview) {
      throw new BadRequestException('Вы уже оставили отзыв на этот товар')
    }

    const review = await this.prismaService.review.create({
      data: {
        text: dto.text,
        rating: dto.rating,
        userId,
        productId: dto.productId,
        shopId: dto.shopId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return {
      id: review.id,
      text: review.text,
      rating: review.rating,
      userId: review.userId,
      shopId: review.shopId,
      productId: review.productId,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      author: review.user,
      product: review.product,
    }
  }

  public async getByProductId(productId: string) {
    const reviews = await this.prismaService.review.findMany({
      where: {
        productId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return reviews.map(review => ({
      id: review.id,
      text: review.text,
      rating: review.rating,
      userId: review.userId,
      shopId: review.shopId,
      productId: review.productId,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      author: review.user,
      product: review.product,
    }))
  }

  public async getByShopId(shopId: string) {
    const reviews = await this.prismaService.review.findMany({
      where: {
        shopId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return reviews.map(review => ({
      id: review.id,
      text: review.text,
      rating: review.rating,
      userId: review.userId,
      shopId: review.shopId,
      productId: review.productId,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      author: review.user,
      product: review.product,
    }))
  }
}
