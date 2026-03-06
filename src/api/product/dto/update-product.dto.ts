import { ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsArray, IsOptional, IsString } from 'class-validator'

import { CreateProductDto } from './create-product.dto'

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({
    description:
      'Массив URL-ов существующих изображений, которые нужно оставить',
    type: [String],
    example: ['https://s3.../img1.jpg'],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return [value]
      }
    }
    return value
  })
  @IsArray()
  @IsString({ each: true })
  existingImages?: string[]
}
