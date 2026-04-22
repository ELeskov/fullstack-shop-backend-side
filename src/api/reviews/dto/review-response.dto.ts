import { ApiProperty } from '@nestjs/swagger'

export class ReviewAuthorResponseDto {
  @ApiProperty({
    description: 'ID пользователя',
    example: 'a2f5d2d3-2d1f-49aa-bf5c-2cb0c2d51111',
  })
  id!: string

  @ApiProperty({
    description: 'Имя автора отзыва',
    example: 'Егор',
  })
  name!: string

  @ApiProperty({
    description: 'Аватар пользователя',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  picture!: string
}

export class ReviewProductResponseDto {
  @ApiProperty({
    description: 'ID товара',
    example: '5fdf4fd7-9970-4d89-a26a-0e998c0c1111',
  })
  id!: string

  @ApiProperty({
    description: 'Название товара',
    example: 'Настольная лампа LED',
  })
  title!: string
}

export class ReviewResponseDto {
  @ApiProperty({
    description: 'ID отзыва',
    example: '3f86b8d9-d7a1-438a-a4d2-8b0b3d8d1111',
  })
  id!: string

  @ApiProperty({
    description: 'Текст отзыва',
    example: 'Очень понравился товар',
  })
  text!: string

  @ApiProperty({
    description: 'Оценка',
    example: 5,
  })
  rating!: number

  @ApiProperty({
    description: 'ID пользователя',
    example: 'a2f5d2d3-2d1f-49aa-bf5c-2cb0c2d51111',
  })
  userId!: string

  @ApiProperty({
    description: 'ID магазина',
    example: '1f8d1d7c-7d85-4ff8-93c3-f5fd872b1111',
  })
  shopId!: string

  @ApiProperty({
    description: 'ID товара',
    example: '5fdf4fd7-9970-4d89-a26a-0e998c0c1111',
  })
  productId!: string

  @ApiProperty({
    description: 'Дата создания',
    example: '2026-04-08T12:00:00.000Z',
  })
  createdAt!: Date

  @ApiProperty({
    description: 'Дата обновления',
    example: '2026-04-08T12:00:00.000Z',
  })
  updatedAt!: Date

  @ApiProperty({
    description: 'Автор отзыва',
    type: ReviewAuthorResponseDto,
  })
  author!: ReviewAuthorResponseDto

  @ApiProperty({
    description: 'Товар',
    type: ReviewProductResponseDto,
  })
  product!: ReviewProductResponseDto
}
