import {
  Body,
  Controller,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
} from '@nestjs/common'
import {
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger'

import { Authorization } from '@/shared/decorators/auth.decorator'
import { Authorized } from '@/shared/decorators/authorized.decorator'
import { ConflictErrorDto } from '@/types/error-response.dto'

import { CreateShopDto } from './dto/create-shop.dto'
import { UploadLogoShopRequestDto } from './dto/upload-logo-shop-request.dto'
import { UploadLogoShopDto } from './dto/upload-logo-shop.dto'
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
  ) {
    return this.shopService.upload(file)
  }
}
