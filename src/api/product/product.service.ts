import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from '@prisma/generated/client'

import { CreateProductDto } from '@/api/product/dto/create-product.dto'
import { UpdateProductDto } from '@/api/product/dto/update-product.dto'
import { S3Service } from '@/api/s3/s3.service'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { extractKeyFromUrl } from '@/shared/utils/extractionKeyFromUrl'

@Injectable()
export class ProductService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  public async create(
    userId: string,
    shopId: string,
    dto: CreateProductDto,
    files?: Express.Multer.File[],
  ) {
    await this.verifyShopOwnership(userId, shopId)

    let uploadedImageUrls: string[] = []

    if (files && files.length > 0) {
      uploadedImageUrls = await Promise.all(
        files.map(async file => {
          const uploaded = await this.s3Service.upload('product', file)
          return uploaded.path
        }),
      )
    }

    const product = await this.prismaService.product.create({
      data: {
        shopId,
        title: dto.title,
        description: dto.description,
        price: dto.price,
        categoryId: dto.categoryId,
        colorId: dto.colorId,
        images: uploadedImageUrls,

        groupedOptions: dto.groupOptions?.length
          ? {
              create: dto.groupOptions.map(group => ({
                groupName: group.groupName,
                options: {
                  create: group.options.map(option => ({
                    name: option.name,
                    value: option.value,
                  })),
                },
              })),
            }
          : undefined,
      },
      include: {
        groupedOptions: {
          include: {
            options: true,
          },
        },
      },
    })

    return product
  }

  public async findById(id: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      include: {
        category: true,
        color: true,
        groupedOptions: {
          include: {
            options: true,
          },
        },
        reviews: true,
      },
    })

    if (!product) {
      throw new NotFoundException('Товар не найден')
    }

    return product
  }

  public async findAllByShopId(shopId: string) {
    return this.prismaService.product.findMany({
      where: { shopId },
      include: {
        category: true,
        color: true,
      },
    })
  }

  public async update(
    userId: string,
    shopId: string,
    productId: string,
    dto: UpdateProductDto,
    files?: Express.Multer.File[],
  ) {
    await this.verifyShopOwnership(userId, shopId)

    const existingProduct = await this.prismaService.product.findUnique({
      where: { id: productId, shopId },
      include: { groupedOptions: true },
    })

    if (!existingProduct) {
      throw new NotFoundException('Продукт не найден или не принадлежит вам')
    }

    let uploadedImageUrls: string[] = []

    if (files && files.length > 0) {
      const uploadResults = await Promise.all(
        files.map(file => this.s3Service.upload('product', file)),
      )
      uploadedImageUrls = uploadResults.map(res => res.path)
    }

    const finalImages = [...(dto.existingImages || []), ...uploadedImageUrls]

    const updateData: Prisma.ProductUpdateInput = {
      title: dto.title,
      description: dto.description,
      price: dto.price,

      images: finalImages,
    }
    if (dto.categoryId) {
      updateData.category = {
        connect: { id: dto.categoryId },
      }
    }

    if (dto.colorId) {
      updateData.color = {
        connect: { id: dto.colorId },
      }
    } else if (dto.colorId === null) {
      updateData.color = { disconnect: true }
    }

    if (dto.groupOptions) {
      updateData.groupedOptions = {
        deleteMany: {},
        create: dto.groupOptions.map(group => ({
          groupName: group.groupName,
          options: {
            create: group.options.map(option => ({
              name: option.name,
              value: option.value,
            })),
          },
        })),
      }
    }

    return this.prismaService.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        category: true,
        color: true,
        groupedOptions: { include: { options: true } },
      },
    })
  }

  public async delete(userId: string, shopId: string, productId: string) {
    await this.verifyShopOwnership(userId, shopId)

    const product = await this.prismaService.product.findUnique({
      where: { id: productId, shopId },
    })

    if (!product) {
      throw new NotFoundException('Продукт не найден')
    }

    await this.prismaService.product.delete({
      where: { id: productId },
    })
    if (product.images.length > 0) {
      await Promise.all(
        product.images.map(url => {
          const key = extractKeyFromUrl(url)

          return this.s3Service.delete(key)
        }),
      )
    }

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
