import { Module } from '@nestjs/common'

import { MailModule } from '@/libs/mail/mail.module'

import { AccountModule } from './auth/account/account.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { TurnstileModule } from 'nestjs-cloudflare-captcha'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { getTurnstileConfig } from '@/config/loaders/turnstile.config-loader'
import { S3Module } from './s3/s3.module';

@Module({
  imports: [
    AuthModule,
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
