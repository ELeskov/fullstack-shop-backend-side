import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common'
import {
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger'

import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator'
import { Authorization } from '@/shared/decorators/auth.decorator'
import { Authorized } from '@/shared/decorators/authorized.decorator'

import { CategoryService } from './category.service'
import { CategoryResponseDto } from './dto/category-response.dto'
import { CreateCategoryDto } from './dto/create-category.dto'

@ApiTags('Categories')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post(':shopId')
  @Authorization()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать категорию для магазина' })
  @ApiParam({
    name: 'shopId',
    description: 'Уникальный идентификатор магазина',
  })
  @ApiOkResponse({
    description: 'Категория успешно создана',
    type: CategoryResponseDto,
  })
  @ApiBody({ type: CreateCategoryDto })
  @ApiCommonErrors()
  public create(
    @Authorized('id') userId: string,
    @Param('shopId') shopId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoryService.create(userId, shopId, dto)
  }

  @Get('')
  @ApiOperation({ summary: 'Получение всех категорий' })
  @ApiOkResponse({
    description: 'Категории успешно получены',
    isArray: true,
    type: CategoryResponseDto,
  })
  @ApiCommonErrors()
  public findAll() {
    return this.categoryService.findAll()
  }

  @Delete(':shopId/:categoryId')
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Удалить категорию магазина' })
  @ApiParam({
    name: 'shopId',
    description: 'Уникальный идентификатор магазина',
  })
  @ApiParam({ name: 'categoryId', description: 'ID удаляемой категории' })
  @ApiOkResponse({ description: 'Категория удалена', type: Boolean })
  @ApiCommonErrors()
  public delete(
    @Authorized('id') userId: string,
    @Param('shopId') shopId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.categoryService.delete(userId, shopId, categoryId)
  }
}
