import { Body, Controller, Delete, Post } from '@nestjs/common'
import {
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger'

import { Authorization } from '@/shared/decorators/auth.decorator'

import { CategoryService } from './category.service'
import { CategoryResponseDto } from './dto/category-response.dto'
import { CreateCategoryDto } from './dto/create-category.dto'
import { DeleteCategoryDto } from './dto/delete-category.dto'

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({ description: 'Создание категории' })
  @ApiOkResponse({ type: CategoryResponseDto })
  @ApiBody({
    type: CreateCategoryDto,
  })
  public create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto)
  }

  @Delete()
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({ description: 'Удаление категории' })
  @ApiOkResponse({ example: true })
  @ApiBody({
    type: DeleteCategoryDto,
  })
  public delete(@Body() dto: DeleteCategoryDto) {
    return this.categoryService.delete(dto)
  }
}
