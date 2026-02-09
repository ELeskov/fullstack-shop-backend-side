import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import {
  ApiConflictResponse,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger'

import { Authorization } from '@/shared/decorators/auth.decorator'
import { Authorized } from '@/shared/decorators/authorized.decorator'
import { ConflictErrorDto } from '@/types/error-response.dto'

import { CreateShopDto } from './dto/create-shop.dto'
import { ShopService } from './shop.service'

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post('')
  @Authorization()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Создание магазина' })
  @ApiOkResponse({
    description: 'Магазин успешно создался',
  })
  @ApiConflictResponse({
    description: 'Ошибка при создании магазина',
    type: ConflictErrorDto,
  })
  public async create(
    @Authorized('id') userId: string,
    @Body() dto: CreateShopDto,
  ) {
    return this.shopService.create(userId, dto)
  }
}
