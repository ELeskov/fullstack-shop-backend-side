import { ConflictException, Injectable } from '@nestjs/common'

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

  public async create(
    userId: string,
    { title, description, file }: CreateShopDto,
  ) {
    try {
      const { path } = await this.s3Service.upload(
        S3_NAME_FOLDERS.S3_SHOP_LOGO,
        file,
      )
      
      const shop = await this.prismaService.shop.create({
        data: {
          title,
          description,
          picture: path,
          userId,
        },
      })

      if (!shop) {
        throw new ConflictException('Ошибка при создании магазина')
      }

      return true
    } catch (error) {
      throw new ConflictException(error)
    }
  }
}
