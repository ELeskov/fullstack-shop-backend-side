import { ApiProperty } from '@nestjs/swagger'

export class StatisticsSummaryResponseDto {
  @ApiProperty({
    description: 'Общая выручка продавца за выбранный период',
    example: 1224.1,
  })
  totalRevenue!: number

  @ApiProperty({
    description: 'Количество товаров продавца',
    example: 142,
  })
  productsCount!: number

  @ApiProperty({
    description: 'Количество категорий продавца',
    example: 14,
  })
  categoriesCount!: number

  @ApiProperty({
    description: 'Средний рейтинг продавца',
    example: 4.8,
  })
  averageRating!: number
}

export class StatisticsChartPointResponseDto {
  @ApiProperty({
    description: 'Дата точки графика в формате YYYY-MM-DD',
    example: '2026-06-30',
  })
  date!: string

  @ApiProperty({
    description: 'Выручка за дату',
    example: 320.5,
  })
  revenue!: number

  @ApiProperty({
    description: 'Количество заказов за дату',
    example: 3,
  })
  ordersCount!: number
}

export class StatisticsResponseDto {
  @ApiProperty({
    description: 'Сводные показатели статистики',
    type: StatisticsSummaryResponseDto,
  })
  summary!: StatisticsSummaryResponseDto

  @ApiProperty({
    description: 'Данные для графика',
    type: StatisticsChartPointResponseDto,
    isArray: true,
  })
  chart!: StatisticsChartPointResponseDto[]
}
