import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'

import { ProductFilterDto } from '@/api/product/dto/product-filter.dto'
import { CatalogProductDto } from '@/api/product/dto/product-filtered-response.dto'
import { ProductResponseDto } from '@/api/product/dto/product-response.dto'
import { UpdateProductDto } from '@/api/product/dto/update-product.dto'
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator'
import { Authorization } from '@/shared/decorators/auth.decorator'
import { Authorized } from '@/shared/decorators/authorized.decorator'

import { CreateProductDto } from './dto/create-product.dto'
import { ProductService } from './product.service'

@ApiTags('Products')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post(':shopId')
  @Authorization()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать продукт с опциями и изображениями' })
  @ApiParam({ name: 'shopId', description: 'ID магазина' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateProductDto,
    description:
      'Данные продукта. Для загрузки картинок используйте поле files. Опции передавайте как JSON-строку в groupOptions.',
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOkResponse({ description: 'Продукт успешно создан' })
  @ApiCommonErrors()
  public async create(
    @Authorized('id') userId: string,
    @Param('shopId') shopId: string,
    @Body() dto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productService.create(userId, shopId, dto, files)
  }

  @Get('shop/:shopId')
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Получить все товары магазина',
    description:
      'Возвращает список всех товаров, принадлежащих указанному магазину, включая краткую информацию о категории и цвете.',
  })
  @ApiParam({ name: 'shopId', description: 'ID магазина' })
  @ApiOkResponse({
    description: 'Список товаров магазина успешно получен',
    type: ProductResponseDto,
    isArray: true,
  })
  @ApiCommonErrors()
  public async findAllByShopId(@Param('shopId') shopId: string) {
    return this.productService.findAllByShopId(shopId)
  }

  @Get()
  @ApiOperation({
    summary: 'Получить все товары',
    description: 'Возвращает список всех товаров',
  })
  @ApiOkResponse({
    description: 'Список товаров успешно получен',
    type: ProductResponseDto,
    isArray: true,
  })
  @ApiCommonErrors()
  public async findAll() {
    return this.productService.findAll()
  }

  @Get('filters')
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Получить отфильтрованный список товаров' })
  @ApiQuery({
    name: 'categoryIds',
    required: false,
    type: [String],
    example: ['category-1', 'category-2'],
    description: 'Список id категорий',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    example: 100,
    description: 'Минимальная цена',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    example: 1000,
    description: 'Максимальная цена',
  })
  @ApiQuery({
    name: 'colorIds',
    required: false,
    type: [String],
    example: ['color-1', 'color-2'],
    description: 'Список id цветов',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'крем',
    description: 'Поиск по названию товара',
  })
  @ApiQuery({
    name: 'brandIds',
    required: false,
    type: String,
    example: 'NIVEA',
    description: 'Фильтр по бренду',
  })
  @ApiOkResponse({
    description: 'Список товаров успешно получен',
    type: CatalogProductDto,
    isArray: true,
  })
  @ApiCommonErrors()
  public async getProducts(
    @Authorized('id') userId: string,
    @Query() query: ProductFilterDto,
  ) {
    return this.productService.findAllWithFilters(userId, query)
  }

  @Get(':id')
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Получить детальную информацию о товаре',
    description:
      'Возвращает полную информацию о товаре по его ID, включая все характеристики (groupedOptions), категорию, цвет и отзывы.',
  })
  @ApiParam({ name: 'id', description: 'Уникальный ID товара' })
  @ApiOkResponse({
    description: 'Детальная информация о товаре успешно получена',
    type: ProductResponseDto,
  })
  @ApiCommonErrors()
  public async findById(@Param('id') id: string) {
    return this.productService.findById(id)
  }

  @Patch(':shopId/:productId')
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Обновить продукт' })
  @ApiParam({ name: 'shopId', description: 'ID магазина' })
  @ApiParam({ name: 'productId', description: 'ID редактируемого продукта' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProductDto })
  @ApiOkResponse({
    description: 'Продукт успешно обновлен',
    type: ProductResponseDto,
  })
  @ApiCommonErrors()
  @UseInterceptors(FilesInterceptor('files', 10))
  public async update(
    @Authorized('id') userId: string,
    @Param('shopId') shopId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.productService.update(userId, shopId, productId, dto, files)
  }

  @Delete(':shopId/:productId')
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Удалить продукт' })
  @ApiParam({ name: 'shopId', description: 'ID магазина' })
  @ApiParam({ name: 'productId', description: 'ID удаляемого продукта' })
  @ApiOkResponse({ description: 'Продукт успешно удален', type: Boolean })
  @ApiCommonErrors()
  public async delete(
    @Authorized('id') userId: string,
    @Param('shopId') shopId: string,
    @Param('productId') productId: string,
  ) {
    return this.productService.delete(userId, shopId, productId)
  }
}
