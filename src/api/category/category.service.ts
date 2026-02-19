import { ConflictException, Injectable } from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { ApiErrorCode } from '@/shared/types/api-error-response.dto'

import { CreateCategoryDto } from './dto/create-category.dto'
import { DeleteCategoryDto } from './dto/delete-category.dto'

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(dto: CreateCategoryDto) {
    const newCategory = await this.prismaService.category.create({
      data: {
        title: dto.title,
        description: dto.description,
        shopId: dto.shopId,
      },
      omit: {
        updatedAt: true,
      },
    })

    if (!newCategory) {
      throw new ConflictException({
        message: 'Не удалось создать категорию',
        code: ApiErrorCode.CONFLICT,
      })
    }

    return newCategory
  }

  public async delete(dto: DeleteCategoryDto) {
    await this.prismaService.category.delete({
      where: {
        id: dto.categoryId,
      },
    })

    return true
  }
}
