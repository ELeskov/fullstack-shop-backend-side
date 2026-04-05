import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ProductOptionResponseDto {
  @ApiProperty({ example: 'uuid-1234' })
  id!: string

  @ApiProperty({ example: 'Размер' })
  name!: string

  @ApiProperty({ example: 'XL' })
  value!: string

  @ApiProperty()
  createdAt!: Date
}

export class GroupOptionResponseDto {
  @ApiProperty({ example: 'uuid-5678' })
  id!: string

  @ApiProperty({ example: 'Характеристики' })
  groupName!: string

  @ApiProperty({ type: [ProductOptionResponseDto] })
  options!: ProductOptionResponseDto[]

  @ApiProperty()
  createdAt!: Date
}

export class ProductCategoryResponseDto {
  @ApiProperty({ example: 'uuid-cat' })
  id!: string

  @ApiProperty({ example: 'Электроника' })
  title!: string
}

export class ProductShopResponseDto {
  @ApiProperty({ example: 'uuid-col' })
  id!: string

  @ApiProperty({ example: 'Shop' })
  title!: string
}

export class ProductColorResponseDto {
  @ApiProperty({ example: 'uuid-col' })
  id!: string

  @ApiProperty({ example: 'Черный' })
  title!: string

  @ApiProperty({ example: '#000000' })
  value!: string
}

export class ProductResponseDto {
  @ApiProperty({ example: 'uuid-product' })
  id!: string

  @ApiProperty({ example: 'iPhone 15' })
  title!: string

  @ApiProperty({ example: 'Отличный смартфон...' })
  description!: string

  @ApiProperty({ example: 89990 })
  price!: number

  @ApiProperty({ type: [String], example: ['https://s3.../img1.jpg'] })
  images!: string[]

  @ApiPropertyOptional({ type: ProductShopResponseDto })
  shop!: ProductShopResponseDto

  @ApiProperty({ example: 'uuid-category' })
  categoryId!: string

  @ApiPropertyOptional({ example: 'uuid-color' })
  colorId!: string | null

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  @ApiPropertyOptional({ type: () => ProductCategoryResponseDto })
  category?: ProductCategoryResponseDto

  @ApiPropertyOptional({ type: () => ProductColorResponseDto, nullable: true })
  color?: ProductColorResponseDto | null

  @ApiPropertyOptional({ type: [GroupOptionResponseDto] })
  groupedOptions?: GroupOptionResponseDto[]
}
