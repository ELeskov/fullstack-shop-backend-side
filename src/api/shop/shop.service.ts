import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { User } from '@prisma/generated/client'

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

    return true
  }

  public async upload(user: User, file: Express.Multer.File) {
    try {
      if (!file) {
        throw new NotFoundException('Файл не найден')
      }

      const { path } = await this.s3Service.upload(
        S3_NAME_FOLDERS.S3_SHOP_LOGO,
        file,
      )

      if (!path) {
        throw new NotFoundException('Ошибка создания файла')
      }

      // await this.prismaService.shop.update({
      //   where: {
      //     userId: user.
      //   },
      // })

      return { path }
    } catch (error) {
      throw new ConflictException(error)
    }
  }
}
