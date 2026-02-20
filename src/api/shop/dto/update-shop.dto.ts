import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class UpdateShopDto {
  @ApiProperty({
    example: 'TechZone',
    description: 'Название магазина',
  })
  @IsString()
  title!: string

  @ApiProperty({
    example: 'Магазин электроники и аксессуаров с быстрой доставкой.',
    description: 'Короткое описание магазина',
  })
  @IsString()
  description!: string

  @ApiProperty({
    example: '12hv12d121c1-d1351jhk1bh2i1d-dfiygdf6y8dgaf8',
    description: 'Id магазина',
  })
  @IsString()
  @IsString()
  shopId!: string
}
