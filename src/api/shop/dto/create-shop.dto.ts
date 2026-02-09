import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CreateShopDto {
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
}
