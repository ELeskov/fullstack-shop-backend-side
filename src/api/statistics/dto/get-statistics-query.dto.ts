import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional } from 'class-validator'

export class GetStatisticsQueryDto {
  @ApiPropertyOptional({
    description: 'Период статистики',
    enum: ['7d', '30d', '90d'],
    example: '90d',
    default: '90d',
  })
  @IsOptional()
  @IsIn(['7d', '30d', '90d'])
  period?: '7d' | '30d' | '90d'
}
