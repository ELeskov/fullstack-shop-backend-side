import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { YookassaModule } from 'nestjs-yookassa'

import { getYookassaConfig } from '@/config/loaders/yookassa.config-loader'

import { YoomoneyService } from './yoomoney.service'

@Module({
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
