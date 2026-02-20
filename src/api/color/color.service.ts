import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { ApiErrorCode } from '@/shared/types/api-error-response.dto'

import { CreateColorDto } from './dto/create-color.dto'
import { DeleteColorDto } from './dto/delete-color.dto'

@Injectable()
export class ColorService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async create(userId: string, dto: CreateColorDto) {
    await this.assertShopAccess(userId, dto.shopId)

    const created = await this.prismaService.color.create({
      data: {
        shopId: dto.shopId,
        title: dto.title,
        value: dto.value.toUpperCase(),
      },
    })

    return created
  }

  public async delete(userId: string, dto: DeleteColorDto) {
    await this.assertShopAccess(userId, dto.shopId)

    const color = await this.prismaService.color.findFirst({
      where: {
        id: dto.colorId,
        shopId: dto.shopId,
      },
      select: { id: true },
    })

    if (!color) {
      throw new NotFoundException({
        message: 'Цвет не найден',
        code: ApiErrorCode.NOT_FOUND,
      })
    }

    await this.prismaService.color.delete({ where: { id: dto.colorId } })

    return true
  }

  private async assertShopAccess(userId: string, shopId: string) {
    const shop = await this.prismaService.shop.findUnique({
      where: { id: shopId },
      select: { id: true, userId: true },
    })

    if (!shop) {
      throw new NotFoundException({
        message: 'Магазин не найден',
        code: ApiErrorCode.NOT_FOUND,
      })
    }

    if (shop.userId !== userId) {
      throw new ForbiddenException({
        message: 'Нет доступа к магазину',
        code: ApiErrorCode.FORBIDDEN,
      })
    }
  }
}
