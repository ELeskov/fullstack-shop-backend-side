import { ApiProperty } from '@nestjs/swagger'
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator'

export class ShopDto {
  @ApiProperty()
  @IsString()
  title!: string
}

export class ColorDto {
  @ApiProperty()
  @IsString()
  title!: string
}

export class CatalogProductDto {
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

  @ApiProperty({ type: ShopDto })
  @IsObject()
  shop!: ShopDto

  @ApiProperty({ type: ColorDto })
  @IsObject()
  color!: ColorDto

  @ApiProperty()
  @IsBoolean()
  isFavorite!: boolean
}
