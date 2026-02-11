import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { S3_NAME_FOLDERS } from '@/shared/consts'

import { S3Service } from '../s3/s3.service'

import { CreateShopDto } from './dto/create-shop.dto'

@Injectable()
export class ShopService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  public async create(userId: string, { title, description }: CreateShopDto) {
    const { id } = await this.prismaService.shop.create({
      data: {
        title,
        description,
        userId,
      },
    })

    if (!id) {
      throw new ConflictException('Ошибка при создании магазина')
    }

    return { shopId: id }
  }

  public async getMeShops(userId: string) {
    return await this.prismaService.shop.findMany({
      where: {
        userId,
      },
    })
  }

  public async upload(shopId: string, file: Express.Multer.File) {
    try {
      if (!file || !shopId) {
        throw new NotFoundException('Файл не найден')
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
