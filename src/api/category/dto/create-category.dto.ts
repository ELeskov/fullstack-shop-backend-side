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

  @ApiProperty({
    example: '12hv12d121c1-d1351jhk1bh2i1d-dfiygdf6y8dgaf8',
    description: 'Id магазина',
  })
  @IsString()
  shopId!: string
}
