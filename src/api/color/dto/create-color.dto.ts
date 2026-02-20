import { ApiProperty } from '@nestjs/swagger'
import { IsHexColor, IsString, IsUUID, Length } from 'class-validator'

export class CreateColorDto {
  @ApiProperty({
    example: 'c8cbd1a7-7d9c-4c6f-8b2c-4db6c7d1a0aa',
    description: 'ID магазина',
  })
  @IsUUID()
  shopId!: string

  @ApiProperty({ example: 'Белый', description: 'Название цвета' })
  @IsString()
  @Length(1, 64)
  title!: string

  @ApiProperty({ example: '#FFFFFF', description: 'HEX значение цвета' })
  @IsHexColor()
  value!: string
}
