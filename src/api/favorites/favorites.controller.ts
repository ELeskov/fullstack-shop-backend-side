// favorites.controller.ts
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger'

import { UserFavoritesResponseDto } from '@/api/favorites/dto/userFavoritesResponse.dto'
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator'
import { Authorization } from '@/shared/decorators/auth.decorator'
import { Authorized } from '@/shared/decorators/authorized.decorator'

import { FavoritesService } from './favorites.service'

@Controller('favorites')
@Authorization()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить избранное пользователя',
    description: 'Возвращает все товары в избранном текущего пользователя',
  })
  @ApiOkResponse({
    description: 'Избранное пользователя',
    type: UserFavoritesResponseDto,
  })
  @ApiCommonErrors()
  findByUser(@Authorized('id') userId: string) {
    return this.favoritesService.findByUser(userId)
  }

  @Post(':productId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Добавить товар в избранное',
    description: 'Добавляет указанный товар в избранное текущего пользователя',
  })
  @ApiParam({
    name: 'productId',
    description: 'UUID товара',
    example: '1fb77501-652d-4f10-90a1-4d64fbadd5ab',
  })
  @ApiOkResponse({
    description: 'Товар успешно добавлен в избранное',
    type: Boolean,
    example: true,
  })
  @ApiCommonErrors()
  addToFavorites(
    @Authorized('id') userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.favoritesService.addToFavorites(userId, productId)
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Удалить товар из избранных',
    description: 'Удаляет указанный товар из избранного текущего пользователя',
  })
  @ApiParam({
    name: 'productId',
    description: 'UUID товара',
    example: '1fb77501-652d-4f10-90a1-4d64fbadd5ab',
  })
  @ApiOkResponse({
    description: 'Товар успешно добавлен в избранное',
    type: Boolean,
    example: true,
  })
  @ApiCommonErrors()
  removeFromFavorites(
    @Authorized('id') userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.favoritesService.removeFromFavorites(userId, productId)
  }
}
