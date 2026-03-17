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

import { ColorService } from './color.service'
import { ColorResponseDto } from './dto/color-response.dto'
import { CreateColorDto } from './dto/create-color.dto'

@ApiTags('Colors')
@Controller('color')
export class ColorController {
  constructor(private readonly colorService: ColorService) {}

  @Post(':shopId')
  @Authorization()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Создать цвет для магазина',
    description:
      'Создает новый цвет, привязанный к указанному магазину. Операция доступна только владельцу магазина.',
  })
  @ApiParam({
    name: 'shopId',
    description: 'Уникальный идентификатор магазина',
    example: 'clhg123450000abcde12345',
  })
  @ApiBody({
    type: CreateColorDto,
    description:
      'Данные цвета: название (например, "Красный") и значение (например, "#FF0000")',
  })
  @ApiOkResponse({ description: 'Цвет успешно создан', type: ColorResponseDto })
  @ApiCommonErrors()
  public async create(
    @Authorized('id') userId: string,
    @Param('shopId') shopId: string,
    @Body() dto: CreateColorDto,
  ) {
    return this.colorService.create(userId, shopId, dto)
  }

  @Get('')
  @ApiOperation({ summary: 'Получение всех цветов' })
  @ApiOkResponse({
    description: 'Цвета успешно получены',
    isArray: true,
    type: ColorResponseDto,
  })
  @ApiCommonErrors()
  public findAll() {
    return this.colorService.findAll()
  }

  @Delete(':shopId/:colorId')
  @Authorization()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Удалить цвет магазина',
    description:
      'Удаляет цвет по его идентификатору. Требует прав владельца магазина.',
  })
  @ApiParam({
    name: 'shopId',
    description: 'Уникальный идентификатор магазина',
    example: 'clhg123450000abcde12345',
  })
  @ApiParam({
    name: 'colorId',
    description: 'Уникальный идентификатор удаляемого цвета',
    example: 'clhg987650000xyzw98765',
  })
  @ApiOkResponse({
    description: 'Цвет успешно удалён',
    type: Boolean,
  })
  @ApiCommonErrors()
  public async delete(
    @Authorized('id') userId: string,
    @Param('shopId') shopId: string,
    @Param('colorId') colorId: string,
  ) {
    return this.colorService.delete(userId, shopId, colorId)
  }
}
