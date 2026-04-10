import { Module } from '@nestjs/common'

import { YoomoneyService } from '@/api/providers/yoomoney/yoomoney.service'

import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, YoomoneyService],
})
export class OrdersModule {}
