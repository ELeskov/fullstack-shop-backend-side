import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger'

import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator'
import { Authorization } from '@/shared/decorators/auth.decorator'
import { Authorized } from '@/shared/decorators/authorized.decorator'

import { CategoryResponseDto } from '../category/dto/category-response.dto'
import { ColorResponseDto } from '../color/dto/color-response.dto'

import { CreateShopResponseDto } from './dto/create-shop-response.dto'
import { CreateShopDto } from './dto/create-shop.dto'
import { DeleteShopDto } from './dto/delete-shop.dto'
import { ShopResponseDto } from './dto/shop-response.dto'
import { UpdateShopDto } from './dto/update-shop.dto'
import { UploadLogoShopRequestDto } from './dto/upload-logo-shop-request.dto'
import { UploadLogoShopDto } from './dto/upload-logo-shop.dto'
import { ShopService } from './shop.service'

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post()
  @Authorization()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создание магазина' })
  @ApiOkResponse({
    description: 'Магазин успешно создался',
    type: ShopResponseDto,
  })
  @ApiCommonErrors()
  public async create(
    @Authorized('id') userId: string,
    @Body() dto: CreateShopDto,
  ) {
    return this.shopService.create(userId, dto)
  }

  @Post('logo')
  @Authorization()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Сохранение или обновление логотипа магазина' })
  @ApiCommonErrors()
  @ApiOkResponse({
    description: 'Логотип успешно сохранен',
    type: UploadLogoShopRequestDto,
  })
  @ApiBody({
    type: UploadLogoShopDto,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  public async setShopPicture(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /\/(jpg|jpeg|png|webp)$/,
          }),
          new MaxFileSizeValidator({
            maxSize: 1000 * 1000 * 10,
            message: 'Можно загружать файлы не больше 10 МБ',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('shopId') shopId: string,
  ) {
    return this.shopService.setShopPicture(shopId, file)
  }

  @Get('@me')
  @Authorization()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @ApiCommonErrors()
  @ApiOperation({ summary: 'Мои магазины' })
  @ApiOkResponse({ type: ShopResponseDto, isArray: true })
  async getMyShops(@Authorized('id') userId: string) {
    return this.shopService.getMeAll(userId)
  }

  @Get(':id')
  @Authorization()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Поиск магазина по id' })
  @ApiOkResponse({
    description: 'Магазин найден',
    type: ShopResponseDto,
  })
  @ApiCommonErrors()
  public async getById(@Param('id') shopId: string) {
    return this.shopService.getById(shopId)
  }

  @Get(':shopId/categories')
  @Authorization()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получить все категории магазина' })
  @ApiOkResponse({ type: CategoryResponseDto, isArray: true })
  @ApiCommonErrors()
  async getMyCategories(@Param('shopId') shopId: string) {
    return this.shopService.getMyCategoriesByShopId(shopId)
  }

  @Get(':shopId/colors')
  @Authorization()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получить все цвета магазина' })
  @ApiOkResponse({ type: ColorResponseDto, isArray: true })
  @ApiCommonErrors()
  async getColors(@Param('shopId') shopId: string) {
    return this.shopService.getMeAllColors(shopId)
  }

  @Patch()
  @Authorization()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Обновление названия/описания магазина' })
  @ApiOkResponse({
    description: 'Данные магазин успешно обновлен',
    type: CreateShopResponseDto,
  })
  @ApiBody({
    type: UpdateShopDto,
  })
  @ApiCommonErrors()
  public async update(@Body() dto: UpdateShopDto) {
    return this.shopService.update(dto)
  }

  @Delete()
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Удаление магазина',
  })
  @ApiOkResponse({
    description: 'Магазин успешно удален',
    example: true,
  })
  @ApiBody({
    type: DeleteShopDto,
  })
  @ApiCommonErrors()
  public delete(shopId: string) {
    return this.shopService.delete(shopId)
  }
}
