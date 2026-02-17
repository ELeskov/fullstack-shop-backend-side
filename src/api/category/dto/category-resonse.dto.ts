import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'

export class CategoryResponseDto {
  @ApiProperty({
    description: 'ID категории',
    example: '12hv12d121c1-d1351jhk1bh2i1d-dfiygdf6y8dgaf8',
  })
  @IsString()
  id!: string

  @ApiProperty({ description: 'Название категории', example: 'Куртки' })
  @IsString()
  @MinLength(1)
  title!: string

  @ApiProperty({ description: 'Описание категории', example: 'Куртки' })
  @IsString()
  @MinLength(1)
  description!: string

  @ApiProperty({
    description: 'ID магазина к которому привязана категория',
    example: '12hv12d121c1-d1351jhk1bh2i1d-dfiygdf6y8dgaf8',
  })
  @IsString()
  shopId!: string
}
