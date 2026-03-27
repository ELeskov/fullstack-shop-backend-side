import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDate, IsNumber, IsString, IsUUID } from 'class-validator'

export class FavoriteItemShopDto {
  @ApiProperty()
  @IsString()
  title!: string
}

export class FavoriteItemColorDto {
  @ApiProperty()
  @IsString()
  title!: string
}

export class FavoriteItemProductDto {
  @ApiProperty()
  @IsString()
  id!: string

  @ApiProperty()
  @IsString()
  title!: string

  @ApiProperty()
  @IsNumber()
  price!: number

  @ApiProperty({ type: String, isArray: true })
  @IsArray()
  images!: string[]

  @ApiProperty({ type: FavoriteItemShopDto })
  shop!: FavoriteItemShopDto

  @ApiProperty({ type: FavoriteItemColorDto })
  color!: FavoriteItemColorDto
}

export class FavoriteItemDto {
  @ApiProperty()
  @IsString()
  id!: string

  @ApiProperty()
  @IsUUID()
  favoritesId!: string

  @ApiProperty()
  @IsUUID()
  productId!: string

  @ApiProperty()
  @IsDate()
  createdAt!: Date

  @ApiProperty()
  @IsDate()
  updatedAt!: Date

  @ApiProperty({ type: FavoriteItemProductDto })
  product!: FavoriteItemProductDto
}

export class UserFavoritesResponseDto {
  @ApiProperty()
  @IsString()
  id!: string

  @ApiProperty()
  @IsUUID()
  userId!: string

  @ApiProperty({ type: [FavoriteItemDto] })
  @IsArray()
  favoritesItems!: FavoriteItemDto[]

  @ApiProperty()
  @IsDate()
  createdAt!: Date

  @ApiProperty()
  @IsDate()
  updatedAt!: Date
}
