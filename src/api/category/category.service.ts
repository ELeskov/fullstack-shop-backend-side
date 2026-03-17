import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'

import { CreateCategoryDto } from './dto/create-category.dto'

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(userId: string, shopId: string, dto: CreateCategoryDto) {
    await this.verifyShopOwnership(userId, shopId)

    return this.prismaService.category.create({
      data: {
        title: dto.title,
        description: dto.description,
        shopId,
      },
      omit: {
        updatedAt: true,
      },
    })
  }

  public async findAll() {
    return this.prismaService.category.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  public async delete(userId: string, shopId: string, categoryId: string) {
    await this.verifyShopOwnership(userId, shopId)

    await this.prismaService.category.delete({
      where: {
        id: categoryId,
      },
    })

    return true
  }

  private async verifyShopOwnership(userId: string, shopId: string) {
    const shop = await this.prismaService.shop.findUnique({
      where: { id: shopId },
      select: { userId: true },
    })

    if (!shop) {
      throw new NotFoundException('Магазин не найден')
    }

    if (shop.userId !== userId) {
      throw new ForbiddenException(
        'У вас нет доступа к управлению этим магазином',
      )
    }
  }
}
