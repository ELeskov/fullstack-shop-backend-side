import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'

export class CreateCategoryDto {
  @ApiProperty({ description: 'Название категории', example: 'Куртки' })
  @IsString()
  @MinLength(1)
  title!: string

  @ApiProperty({ description: '', example: 'Куртки' })
  @IsString()
  @MinLength(1)
  description!: string
}
