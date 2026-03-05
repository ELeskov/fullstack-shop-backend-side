import { ApiProperty } from '@nestjs/swagger'
import { IsHexColor, IsString, Length } from 'class-validator'

export class CreateColorDto {
  @ApiProperty({ example: 'Белый', description: 'Название цвета' })
  @IsString()
  @Length(1, 64)
  title!: string

  @ApiProperty({ example: '#FFFFFF', description: 'HEX значение цвета' })
  @IsHexColor()
  value!: string
}
