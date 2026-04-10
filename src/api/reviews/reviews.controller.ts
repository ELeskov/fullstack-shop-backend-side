import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import {
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger'

import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator'
import { Authorization } from '@/shared/decorators/auth.decorator'
import { Authorized } from '@/shared/decorators/authorized.decorator'

import { CreateReviewDto } from './dto/create-review.dto'
import { ReviewResponseDto } from './dto/review-response.dto'
import { ReviewsService } from './reviews.service'

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Создать отзыв на товар',
    description:
      'Создаёт отзыв текущего пользователя на товар. Отзыв можно оставить только на оплаченный купленный товар и только один раз на товар в рамках текущей логики.',
  })
  @ApiBody({
    type: CreateReviewDto,
  })
  @ApiCreatedResponse({
    description: 'Отзыв успешно создан',
    type: ReviewResponseDto,
  })
  @ApiCommonErrors()
  public async create(
    @Authorized('id') userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(userId, dto)
  }

  @Get('product/:productId')
  @ApiOperation({
    summary: 'Получить все отзывы по товару',
    description: 'Возвращает список всех отзывов для указанного товара.',
  })
  @ApiParam({
    name: 'productId',
    description: 'ID товара',
    example: '5fdf4fd7-9970-4d89-a26a-0e998c0c1111',
  })
  @ApiOkResponse({
    description: 'Список отзывов по товару',
    type: ReviewResponseDto,
    isArray: true,
  })
  @ApiCommonErrors()
  public async getByProductId(@Param('productId') productId: string) {
    return this.reviewsService.getByProductId(productId)
  }

  @Get('shop/:shopId')
  @ApiOperation({
    summary: 'Получить все отзывы магазина',
    description: 'Возвращает список всех отзывов для указанного магазина.',
  })
  @ApiParam({
    name: 'shopId',
    description: 'ID магазина',
    example: '1f8d1d7c-7d85-4ff8-93c3-f5fd872b1111',
  })
  @ApiOkResponse({
    description: 'Список отзывов магазина',
    type: ReviewResponseDto,
    isArray: true,
  })
  @ApiCommonErrors()
  public async getByShopId(@Param('shopId') shopId: string) {
    return this.reviewsService.getByShopId(shopId)
  }
}
