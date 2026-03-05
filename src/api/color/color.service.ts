import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'

import { CreateColorDto } from './dto/create-color.dto'

@Injectable()
export class ColorService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async create(userId: string, shopId: string, dto: CreateColorDto) {
    await this.verifyShopOwnership(userId, shopId)

    return this.prismaService.color.create({
      data: {
        shopId,
        title: dto.title,
        value: dto.value.toUpperCase(),
      },
    })
  }

  public async delete(userId: string, shopId: string, colorId: string) {
    await this.verifyShopOwnership(userId, shopId)

    await this.prismaService.color.delete({
      where: {
        id: colorId,
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
