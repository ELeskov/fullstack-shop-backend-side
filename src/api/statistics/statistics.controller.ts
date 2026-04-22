import { Controller, Get, Query } from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

import { GetStatisticsQueryDto } from '@/api/statistics/dto/get-statistics-query.dto'
import { StatisticsResponseDto } from '@/api/statistics/dto/statistics-response.dto'
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator'
import { Authorization } from '@/shared/decorators/auth.decorator'
import { Authorized } from '@/shared/decorators/authorized.decorator'

import { StatisticsService } from './statistics.service'

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('profile')
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Получить статистику текущего продавца',
    description:
      'Возвращает сводные показатели и данные для графика статистики магазина текущего пользователя за выбранный период.',
  })
  @ApiOkResponse({
    description: 'Статистика успешно получена',
    type: StatisticsResponseDto,
  })
  @ApiCommonErrors()
  public async getProfileStatistics(
    @Authorized('id') userId: string,
    @Query() query: GetStatisticsQueryDto,
  ) {
    return this.statisticsService.getProfileStatistics(
      userId,
      query.period ?? '90d',
    )
  }
}
