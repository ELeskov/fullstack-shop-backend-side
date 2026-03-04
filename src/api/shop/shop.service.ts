import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { S3_NAME_FOLDERS } from '@/shared/consts'
import { extractKeyFromUrl } from '@/shared/utils/extractionKeyFromUrl'

import { S3Service } from '../s3/s3.service'

import { CreateShopDto } from './dto/create-shop.dto'
import { UpdateShopDto } from './dto/update-shop.dto'

@Injectable()
export class ShopService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  public async create(userId: string, { title, description }: CreateShopDto) {
    return this.prismaService.shop.create({
      data: {
        title,
        description,
        userId,
      },
    })
  }

  public async setShopPicture(shopId: string, file: Express.Multer.File) {
    if (!file || !shopId) {
      throw new ConflictException('Ошибка валидации данных')
    }

    const existingShop = await this.prismaService.shop.findUnique({
      where: { id: shopId },
      select: { picture: true },
    })

    if (!existingShop) {
      throw new NotFoundException('Магазин не найден')
    }

    try {
      const { path } = await this.s3Service.upload(
        S3_NAME_FOLDERS.S3_SHOP_LOGO,
        file,
      )

      if (!path) {
        throw new InternalServerErrorException('Ошибка при загрузке файла в S3')
      }

      await this.prismaService.shop.update({
        where: { id: shopId },
        data: { picture: path },
      })

      if (existingShop?.picture) {
        const key = extractKeyFromUrl(existingShop.picture)
        await this.s3Service.delete(key)
      }

      return { path }
    } catch (error) {
      throw new ConflictException(error)
    }
  }

  public async getById(shopId: string) {
    const shop = await this.prismaService.shop.findUnique({
      where: {
        id: shopId,
      },
    })

    if (!shop) {
      throw new NotFoundException('Магазина с таким id не найдено')
    }

    return shop
  }

  public async getMeAll(userId: string) {
    return this.prismaService.shop.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  public async getMyCategoriesByShopId(shopId: string) {
    return this.prismaService.category.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
    })
  }

  public async getMeAllColors(shopId: string) {
    return this.prismaService.color.findMany({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
    })
  }

  public async update(dto: UpdateShopDto) {
    return this.prismaService.shop.update({
      where: { id: dto.shopId },
      data: {
        title: dto.title,
        description: dto.description,
      },
    })
  }

  public async delete(shopId: string) {

    await this.prismaService.shop.delete({
      where: {
        id: shopId,
      },
    })

    return true
  }
}
