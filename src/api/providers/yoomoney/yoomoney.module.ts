import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { YookassaModule } from 'nestjs-yookassa'

import { YoomoneyController } from '@/api/providers/yoomoney/yoomoney.controller'
import { getYookassaConfig } from '@/config/loaders/yookassa.config-loader'

import { YoomoneyService } from './yoomoney.service'

@Global()
@Module({
  controllers: [YoomoneyController],
  imports: [
    YookassaModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getYookassaConfig,
      inject: [ConfigService],
    }),
  ],
  providers: [YoomoneyService],
})
export class YoomoneyModule {}
