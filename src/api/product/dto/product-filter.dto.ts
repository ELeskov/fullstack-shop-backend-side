import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsArray, IsIn, IsNumber, IsOptional, IsString } from 'class-validator'

const SORT_VALUES = ['price_desc', 'price_asc', 'newest'] as const
type SortValue = (typeof SORT_VALUES)[number]

export class ProductFilterDto {
  @ApiPropertyOptional({
    example: ['category-1', 'category-2'],
    description: 'Список id категорий',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[]

  @ApiPropertyOptional({
    example: 100,
    description: 'Минимальная цена',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number

  @ApiPropertyOptional({
    example: 1000,
    description: 'Максимальная цена',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number

  @ApiPropertyOptional({
    example: ['color-1', 'color-2'],
    description: 'Список id цветов',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsArray()
  @IsString({ each: true })
  colorIds?: string[]

  @ApiPropertyOptional({
    example: 'крем',
    description: 'Поиск по названию товара',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    example: 'NIVEA',
    description: 'Фильтр по бренду',
    isArray: true,
  })
  @IsOptional()
  @IsString()
  brandIds?: string[]

  @ApiPropertyOptional({
    example: 'news',
    description: 'Сортировка',
    enum: SORT_VALUES,
  })
  @IsIn(SORT_VALUES, {
    message: `sort должен быть одним из: ${SORT_VALUES.join(', ')}`,
  })
  @IsOptional()
  @IsString()
  sort?: SortValue
}
