import { ApiProperty } from '@nestjs/swagger'

class ColorDto {
  @ApiProperty({ example: 'Белый' })
  title!: string

  @ApiProperty({ example: '#FFFFFF' })
  value!: string
}

class CategoryDto {
  @ApiProperty({ example: 'Техника' })
  title!: string
}

class ProductDto {
  @ApiProperty({ example: '1fb77501-652d-4f10-90a1-4d64fbadd5ab' })
  id!: string

  @ApiProperty({ example: 'Смартфон 15 pro' })
  title!: string

  @ApiProperty({ example: 'Телефон топ' })
  description!: string

  @ApiProperty({ example: 130000 })
  price!: number

  @ApiProperty({
    type: String,
    isArray: true,
    example: ['https://4f35f4d0-...'],
  })
  images!: string[]

  @ApiProperty({ example: 'f35baab7-8b32-40ac-8e8f-b3cda275f189' })
  shopId!: string

  @ApiProperty({ example: '1c258488-bd7b-40a2-b2c6-2a31fea4c84d' })
  categoryId!: string

  @ApiProperty({ type: CategoryDto })
  category!: CategoryDto

  @ApiProperty({ example: '5669044e-7f7e-4384-bb96-bb66de49de80' })
  colorId!: string

  @ApiProperty({ type: ColorDto })
  color!: ColorDto

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date
}

class BasketItemDto {
  @ApiProperty({ example: '3173bf36-6659-4199-bee1-82dd86433561' })
  id!: string

  @ApiProperty({ example: 5 })
  quantity!: number

  @ApiProperty({ example: '1f0e1a3f-e588-4127-a249-e711819c778e' })
  basketId!: string

  @ApiProperty({ example: '1fb77501-652d-4f10-90a1-4d64fbadd5ab' })
  productId!: string

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  @ApiProperty({ type: ProductDto })
  product!: ProductDto
}

export class GetBasketResponseDto {
  @ApiProperty({ example: '1f0e1a3f-e588-4127-a249-e711819c778e' })
  id!: string

  @ApiProperty({ example: '9425fbe0-d274-4155-858e-696ee68273a4' })
  userId!: string

  @ApiProperty()
  createdAt!: Date

  @ApiProperty()
  updatedAt!: Date

  @ApiProperty({ type: [BasketItemDto] })
  basketItems!: BasketItemDto[]
}
