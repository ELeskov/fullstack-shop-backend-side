import { ApiProperty } from '@nestjs/swagger'

class ColorDto {
  @ApiProperty({ example: 'Белый' })
  title!: string

  @ApiProperty({ example: '#FFFFFF' })
  value!: string
}


class ProductDto {
  @ApiProperty({ example: '1fb77501-652d-4f10-90a1-4d64fbadd5ab' })
  id!: string

  @ApiProperty({ example: 'Смартфон 15 pro' })
  title!: string

  @ApiProperty({ example: 130000 })
  price!: number

  @ApiProperty({
    type: String,
    isArray: true,
    example: [
      'https://4f35f4d0-2fb4974b-6046-4608-bcaa-2df25d95c300.s3.timeweb.cloud/product/1772824137730-ia352jxnj9-1.webp',
    ],
  })
  images!: string[]

  @ApiProperty({ type: ColorDto })
  color!: ColorDto
}

class BasketItemDto {
  @ApiProperty({ example: '1bdd12db-90c8-4456-9a04-4bd68c023136' })
  id!: string

  @ApiProperty({ example: 1 })
  quantity!: number

  @ApiProperty({ example: true })
  isSelected!: boolean

  @ApiProperty({ type: ProductDto })
  product!: ProductDto
}

export class GetBasketResponseDto {
  @ApiProperty({ example: '1f0e1a3f-e588-4127-a249-e711819c778e' })
  id!: string

  @ApiProperty({ type: [BasketItemDto] })
  basketItems!: BasketItemDto[]
}
