import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'

type StatisticsPeriod = '7d' | '30d' | '90d'

@Injectable()
export class StatisticsService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getProfileStatistics(
    userId: string,
    period: StatisticsPeriod = '90d',
  ) {
    const shopIds = await this.getSellerShopIds(userId)

    if (shopIds.length === 0) {
      return {
        summary: {
          totalRevenue: 0,
          productsCount: 0,
          categoriesCount: 0,
          averageRating: 0,
        },
        chart: this.buildEmptyChart(period),
      }
    }

    const { startDate, endDate } = this.getPeriodRange(period)

    const [productsCount, categoriesCount, reviewsAggregate, paidOrderItems] =
      await Promise.all([
        this.prismaService.product.count({
          where: {
            shopId: {
              in: shopIds,
            },
          },
        }),

        this.prismaService.category.count({
          where: {
            shopId: {
              in: shopIds,
            },
          },
        }),

        this.prismaService.review.aggregate({
          where: {
            shopId: {
              in: shopIds,
            },
          },
          _avg: {
            rating: true,
          },
        }),

        this.prismaService.orderItem.findMany({
          where: {
            shopId: {
              in: shopIds,
            },
            order: {
              status: 'PAYED',
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
          select: {
            price: true,
            quantity: true,
            order: {
              select: {
                id: true,
                createdAt: true,
              },
            },
          },
        }),
      ])

    const totalRevenue = paidOrderItems.reduce((sum, item) => {
      return sum + item.price * item.quantity
    }, 0)

    const chart = this.buildChart(period, paidOrderItems)

    return {
      summary: {
        totalRevenue,
        productsCount,
        categoriesCount,
        averageRating: Number((reviewsAggregate._avg.rating ?? 0).toFixed(1)),
      },
      chart,
    }
  }

  private async getSellerShopIds(userId: string) {
    const shops = await this.prismaService.shop.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    })

    return shops.map(shop => shop.id)
  }

  private getPeriodRange(period: StatisticsPeriod) {
    const endDate = new Date()
    const startDate = new Date(endDate)

    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 6)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 29)
        break
      case '90d':
      default:
        startDate.setDate(endDate.getDate() - 89)
        break
    }

    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    return { startDate, endDate }
  }

  private buildEmptyChart(period: StatisticsPeriod) {
    const { startDate, endDate } = this.getPeriodRange(period)
    const chartMap = this.createChartMap(startDate, endDate)

    return Array.from(chartMap.values())
  }

  private buildChart(
    period: StatisticsPeriod,
    paidOrderItems: Array<{
      price: number
      quantity: number
      order: {
        id: string
        createdAt: Date
      }
    }>,
  ) {
    const { startDate, endDate } = this.getPeriodRange(period)
    const chartMap = this.createChartMap(startDate, endDate)
    const ordersByDate = new Map<string, Set<string>>()

    for (const item of paidOrderItems) {
      const dateKey = this.formatDateKey(item.order.createdAt)

      const point = chartMap.get(dateKey)
      if (!point) {
        continue
      }

      point.revenue += item.price * item.quantity

      if (!ordersByDate.has(dateKey)) {
        ordersByDate.set(dateKey, new Set<string>())
      }

      ordersByDate.get(dateKey)?.add(item.order.id)
    }

    for (const [date, point] of chartMap.entries()) {
      point.ordersCount = ordersByDate.get(date)?.size ?? 0
    }

    return Array.from(chartMap.values())
  }

  private createChartMap(startDate: Date, endDate: Date) {
    const chartMap = new Map<
      string,
      {
        date: string
        revenue: number
        ordersCount: number
      }
    >()

    const current = new Date(startDate)

    while (current <= endDate) {
      const dateKey = this.formatDateKey(current)

      chartMap.set(dateKey, {
        date: dateKey,
        revenue: 0,
        ordersCount: 0,
      })

      current.setDate(current.getDate() + 1)
    }

    return chartMap
  }

  private formatDateKey(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }
}
