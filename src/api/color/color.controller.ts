import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common'
import {
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger'

import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator'
import { Authorization } from '@/shared/decorators/auth.decorator'
import { Authorized } from '@/shared/decorators/authorized.decorator'

import { ColorService } from './color.service'
import { ColorResponseDto } from './dto/color-response.dto'
import { CreateColorDto } from './dto/create-color.dto'
import { DeleteColorDto } from './dto/delete-color.dto'

@Controller('color')
export class ColorController {
  constructor(private readonly colorService: ColorService) {}

  @Post()
  @Authorization()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать цвет для магазина' })
  @ApiBody({ type: CreateColorDto })
  @ApiOkResponse({ description: 'Цвет создан', type: ColorResponseDto })
  @ApiCommonErrors()
  public async create(
    @Authorized('id') userId: string,
    @Body() dto: CreateColorDto,
  ) {
    return this.colorService.create(userId, dto)
  }

  @Delete()
  @Authorization()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить цвет магазина' })
  @ApiBody({ type: DeleteColorDto })
  @ApiOkResponse({ description: 'Цвет удалён', type: CreateColorDto })
  @ApiCommonErrors()
  public async delete(
    @Authorized('id') userId: string,
    @Body() dto: DeleteColorDto,
  ) {
    return this.colorService.delete(userId, dto)
  }
}
