import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { Authorization } from '@/shared/decorators/auth.decorator'
import { Authorized } from '@/shared/decorators/authorized.decorator'
import {
  ConflictErrorDto,
  UnauthorizedErrorDto,
} from '@/types/error-response.dto'

import { CreateShopResponseDto } from './dto/create-shop-response.dto'
import { CreateShopDto } from './dto/create-shop.dto'
import { ShopResponseDto } from './dto/shop-response.dto'
import { UploadLogoShopRequestDto } from './dto/upload-logo-shop-request.dto'
import { UploadLogoShopDto } from './dto/upload-logo-shop.dto'
import { ShopService } from './shop.service'

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post('')
  @Authorization()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создание магазина' })
  @ApiOkResponse({
    description: 'Магазин успешно создался',
    type: CreateShopResponseDto,
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

  @Post('/logo')
  @Authorization()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Сохранение логотипа магазина' })
  @ApiOkResponse({
    description: 'Логотиип успешно сохранен',
    type: UploadLogoShopRequestDto,
  })
  @ApiConflictResponse({
    description: 'Ошибка при сохранении логотипа',
    type: ConflictErrorDto,
  })
  @ApiBody({
    type: UploadLogoShopDto,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  public async upload(
    @Authorized('id') userId: string,
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
    return this.shopService.upload(shopId, file)
  }

  @Get('/@me')
  @Authorization()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({ type: UnauthorizedErrorDto })
  @ApiOperation({ summary: 'Мои магазины' })
  @ApiOkResponse({ type: ShopResponseDto, isArray: true })
  async getMyShops(@Authorized('id') userId: string) {
    return this.shopService.getMeShops(userId)
  }
}
