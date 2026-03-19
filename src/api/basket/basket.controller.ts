import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger'

import { GetBasketResponseDto } from '@/api/basket/dto/get-basket-response.dto'
import { GetQuantityByProductIdResponseDto } from '@/api/basket/dto/get-quantity-by-product-id-response.dto'
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator'
import { Authorization } from '@/shared/decorators/auth.decorator'
import { Authorized } from '@/shared/decorators/authorized.decorator'

import { BasketService } from './basket.service'

@Controller('baskets')
export class BasketController {
  constructor(private readonly basketService: BasketService) {}

  @Post('/products/:productId')
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Добавить товар в корзину' })
  @ApiOkResponse({ description: 'Товар добавлен' })
  @ApiCommonErrors()
  @ApiParam({
    name: 'productId',
    type: String,
    description: 'Уникальный идентификатор товара',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  public async addProductToBasket(
    @Authorized('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.basketService.addProductToBasket(userId, productId)
  }

  @Get('')
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Получить корзину пользователя' })
  @ApiOkResponse({
    type: GetBasketResponseDto,
    description: 'Корзина с товарами получена',
  })
  @ApiCommonErrors()
  public async getBasketByUserId(@Authorized('id') userId: string) {
    return this.basketService.getBasketByUserId(userId)
  }

  @Get('products/:productId')
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Получить количестов товара, добавленного в корзину по ID товара',
  })
  @ApiOkResponse({
    type: GetQuantityByProductIdResponseDto,
    description: 'Количестов товара получено',
  })
  @ApiParam({
    name: 'productId',
    type: String,
    description: 'Уникальный идентификатор товара',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @ApiCommonErrors()
  public async getQuantityByProductId(
    @Authorized('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.basketService.getQuantityByProductId(userId, productId)
  }

  @Patch('products/:productId')
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Убрать 1 еденицу товара из корзины' })
  @ApiOkResponse({ description: 'Удалена 1 еденица товара' })
  @ApiCommonErrors()
  @ApiParam({
    name: 'productId',
    type: String,
    description: 'Уникальный идентификатор товара',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  public async decrementProductFromBasket(
    @Authorized('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.basketService.decrementProductQuantity(userId, productId)
  }

  @Delete('products/:productId')
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Удалить товар из корзины' })
  @ApiOkResponse({ description: 'Товар удален' })
  @ApiCommonErrors()
  @ApiParam({
    name: 'productId',
    type: String,
    description: 'Уникальный идентификатор товара',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  public async deleteProductFromBasket(
    @Authorized('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.basketService.deleteProductFromBasket(userId, productId)
  }
}
