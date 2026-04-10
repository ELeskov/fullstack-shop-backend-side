import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsString, IsUUID, Max, Min } from 'class-validator'

export class CreateReviewDto {
  @ApiProperty({
    description: 'Текст отзыва',
    example: 'Очень хороший товар, качество понравилось.',
  })
  @IsString()
  text!: string

  @ApiProperty({
    description: 'Оценка от 1 до 5',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number

  @ApiProperty({
    description: 'ID товара',
    example: '5fdf4fd7-9970-4d89-a26a-0e998c0c1111',
  })
  @IsUUID()
  productId!: string

  @ApiProperty({
    description: 'ID магазина',
    example: '1f8d1d7c-7d85-4ff8-93c3-f5fd872b1111',
  })
  @IsUUID()
  shopId!: string
}