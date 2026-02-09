import { ConflictException, Injectable } from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'

import { CreateShopDto } from './dto/create-shop.dto'

@Injectable()
export class ShopService {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(userId: string, dto: CreateShopDto) {
    const shop = await this.prismaService.shop.create({
      data: {
        title: dto.title,
        description: dto.description,
        picture: dto.picture,
        userId,
      },
    })

    if (!shop) {
      throw new ConflictException('Ошибка при создании магазина')
    }

    return true
  }
}
