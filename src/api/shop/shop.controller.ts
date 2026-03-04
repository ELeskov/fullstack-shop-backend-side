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
  ApiTags,
} from '@nestjs/swagger'

import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator'
import { Authorization } from '@/shared/decorators/auth.decorator'
import { Authorized } from '@/shared/decorators/authorized.decorator'


import { CreateShopDto } from '@/api/shop/dto/create-shop.dto'
import { ShopService } from '@/api/shop/shop.service'
import { ShopResponseDto } from '@/api/shop/dto/shop-response.dto'
import { UploadLogoShopRequestDto } from '@/api/shop/dto/upload-logo-shop-request.dto'
import { UploadLogoShopDto } from '@/api/shop/dto/upload-logo-shop.dto'
import { CategoryResponseDto } from '@/api/category/dto/category-response.dto'
import { ColorResponseDto } from '@/api/color/dto/color-response.dto'
import { CreateShopResponseDto } from '@/api/shop/dto/create-shop-response.dto'
import { UpdateShopDto } from '@/api/shop/dto/update-shop.dto'
import { DeleteShopDto } from '@/api/shop/dto/delete-shop.dto'

ApiTags('Shops')
@Controller('shops')
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
  public async uploadPicture(
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
    return this.shopService.uploadPicture(shopId, file)
  }

  @Get('@me')
  @Authorization()
  @ApiCookieAuth()
  @ApiCommonErrors()
  @ApiOperation({ summary: 'Мои магазины' })
  @ApiOkResponse({ type: ShopResponseDto, isArray: true })
  async findAllByUserId(@Authorized('id') userId: string) {
    return this.shopService.findAllByUserId(userId)
  }

  @Get(':id')
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Поиск магазина по id' })
  @ApiOkResponse({
    description: 'Магазин найден',
    type: ShopResponseDto,
  })
  @ApiCommonErrors()
  public async findById(@Param('id') shopId: string) {
    return this.shopService.findById(shopId)
  }

  @Get(':shopId/categories')
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Получить все категории магазина' })
  @ApiOkResponse({ type: CategoryResponseDto, isArray: true })
  @ApiCommonErrors()
  async findCategoriesByShopId(@Param('shopId') shopId: string) {
    return this.shopService.findCategoriesByShopId(shopId)
  }

  @Get(':shopId/colors')
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Получить все цвета магазина' })
  @ApiOkResponse({ type: ColorResponseDto, isArray: true })
  @ApiCommonErrors()
  async findColorsByShopId(@Param('shopId') shopId: string) {
    return this.shopService.findColorsByShopId(shopId)
  }

  @Patch(':id')
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Обновление названия/описания магазина' })
  @ApiOkResponse({
    description: 'Данные магазин успешно обновлен',
    type: CreateShopResponseDto,
  })
  @ApiBody({
    type: UpdateShopDto,
  })
  @ApiCommonErrors()
  public async update(@Param('id') id: string, @Body() dto: UpdateShopDto) {
    return this.shopService.update(id, dto)
  }

  @Delete(':id')
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
  public delete(@Param('id') id: string) {
    return this.shopService.delete(id)
  }
}
