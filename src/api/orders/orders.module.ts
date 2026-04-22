import { Module } from '@nestjs/common'

import { ProductService } from '@/api/product/product.service'
import { YoomoneyService } from '@/api/providers/yoomoney/yoomoney.service'

import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, YoomoneyService, ProductService],
})
export class OrdersModule {}
