import { Global, Module } from '@nestjs/common'

import { YoomoneyController } from '@/api/providers/yoomoney/yoomoney.controller'

import { YoomoneyService } from './yoomoney.service'

@Global()
@Module({
  controllers: [YoomoneyController],
  providers: [YoomoneyService],
})
export class YoomoneyModule {}
