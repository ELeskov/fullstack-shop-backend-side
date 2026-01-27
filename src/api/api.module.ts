import { Module } from '@nestjs/common'

import { MailModule } from '@/libs/mail/mail.module'

import { AccountModule } from './auth/account/account.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { TurnstileModule } from 'nestjs-cloudflare-captcha'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { getTurnstileConfig } from '@/config/loaders/turnstile.config-loader'

@Module({
  imports: [
    AuthModule,
    UsersModule,
    AccountModule,
    MailModule,
    TurnstileModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTurnstileConfig,
      inject: [ConfigService],
    }),
  ],
})
export class ApiModule {}
