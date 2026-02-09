import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TurnstileModule } from 'nestjs-cloudflare-captcha'

import { getTurnstileConfig } from '@/config/loaders/turnstile.config-loader'
import { MailModule } from '@/libs/mail/mail.module'

import { AccountModule } from './auth/account/account.module'
import { S3Module } from './s3/s3.module'
import { ShopModule } from './shop/shop.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ShopModule,
    UsersModule,
    AccountModule,
    MailModule,
    S3Module,
    TurnstileModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTurnstileConfig,
      inject: [ConfigService],
    }),
  ],
})
export class ApiModule {}
