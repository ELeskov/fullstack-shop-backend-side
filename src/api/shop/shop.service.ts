import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { S3_NAME_FOLDERS } from '@/shared/consts'
import { ApiErrorCode } from '@/shared/types/api-error-response.dto'
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
    const shop = await this.prismaService.shop.create({
      data: {
        title,
        description,
        userId,
      },
    })

    if (!shop) {
      throw new ConflictException('Ошибка при создании магазина')
    }

    return shop
  }

  public async update({ title, description, shopId }: UpdateShopDto) {
    const shop = await this.prismaService.shop.update({
      where: {
        id: shopId,
      },
      data: {
        title,
        description,
      },
    })

    return shop
  }

  public async getMeAll(userId: string) {
    return await this.prismaService.shop.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  public async getById(shopId: string) {
    const shop = await this.prismaService.shop.findUnique({
      where: {
        id: shopId,
      },
    })
    if (!shop) {
      throw new NotFoundException({
        message: 'Магазина с таким id не найдено',
        code: ApiErrorCode.NOT_FOUND,
      })
    }

    return shop
  }

  public async setShopPicture(shopId: string, file: Express.Multer.File) {
    try {
      if (!file || !shopId) {
        throw new ConflictException({ message: 'Ошибка валидации данных' })
      }

      const existingShop = await this.prismaService.shop.findUnique({
        where: {
          id: shopId,
        },
        select: {
          picture: true,
        },
      })

      if (!existingShop) {
        throw new NotFoundException('Магазин не найден')
      }

      if (existingShop?.picture) {
        const key = extractKeyFromUrl(existingShop.picture)
        await this.s3Service.delete(key)
      }

      const { path } = await this.s3Service.upload(
        S3_NAME_FOLDERS.S3_SHOP_LOGO,
        file,
      )

      if (!path) {
        throw new NotFoundException('Ошибка создания файла')
      }

      await this.prismaService.shop.update({
        where: {
          id: shopId,
        },
        data: {
          picture: path,
        },
      })

      return { path }
    } catch (error) {
      throw new ConflictException(error)
    }
  }
}
