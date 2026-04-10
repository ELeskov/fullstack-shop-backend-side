import { ApiPropertyOptional } from '@nestjs/swagger'
import { EnumOrderStatus } from '@prisma/generated/client'
import { IsEnum, IsOptional } from 'class-validator'

export class GetOrdersQueryDto {
  @ApiPropertyOptional({
    description: 'Фильтр по статусу заказа',
    enum: EnumOrderStatus,
    example: EnumOrderStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(EnumOrderStatus)
  status?: EnumOrderStatus

  @ApiPropertyOptional({
    description: 'Сортировка по дате создания заказа',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortByCreatedAt?: 'asc' | 'desc'
}
