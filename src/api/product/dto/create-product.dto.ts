import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  plainToInstance,
  Transform,
  TransformFnParams,
  Type,
} from 'class-transformer'
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator'

export class ProductOptionDto {
  @ApiProperty({ description: 'Название опции', example: 'Размер' })
  @IsString()
  @IsNotEmpty({ message: 'Название опции обязательно' })
  name!: string

  @ApiProperty({ description: 'Значение опции', example: 'XL' })
  @IsString()
  @IsNotEmpty({ message: 'Значение опции обязательно' })
  value!: string
}

export class GroupOptionDto {
  @ApiProperty({ description: 'Название группы', example: 'Характеристики' })
  @IsString()
  @IsNotEmpty({ message: 'Название группы обязательно' })
  groupName!: string

  @ApiProperty({ description: 'Массив опций', type: [ProductOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOptionDto)
  options!: ProductOptionDto[]
}

export class CreateProductDto {
  @ApiProperty({
    description: 'Название продукта',
    example: 'Футболка oversize',
  })
  @IsString()
  @IsNotEmpty({ message: 'Название не может быть пустым' })
  title!: string

  @ApiProperty({ description: 'Описание продукта', example: 'Хлопок 100%...' })
  @IsString()
  @IsNotEmpty({ message: 'Описание обязательно' })
  description!: string

  @ApiProperty({ description: 'Цена продукта', example: 1500 })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsPositive({ message: 'Цена должна быть больше нуля' })
  price!: number

  @ApiProperty({ description: 'ID категории', example: 'uuid...' })
  @IsUUID('all', { message: 'Неверный формат ID категории' })
  categoryId!: string

  @ApiPropertyOptional({ description: 'ID цвета', example: 'uuid...' })
  @IsOptional()
  @IsUUID('all')
  colorId?: string

  @ApiPropertyOptional({
    description: 'Группы опций. Передавать как JSON-строку',
    type: [GroupOptionDto],
    example:
      '[{"groupName":"Размеры","options":[{"name":"Размер","value":"XL"}]}]',
  })
  @IsOptional()
  @Transform((params: TransformFnParams) => {
    const val: unknown = params.value

    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val) as unknown
        return plainToInstance(GroupOptionDto, parsed)
      } catch {
        return val
      }
    }

    return val
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupOptionDto)
  groupOptions?: GroupOptionDto[]

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Изображения товара (до 10 штук)',
  })
  files?: Express.Multer.File[]
}
