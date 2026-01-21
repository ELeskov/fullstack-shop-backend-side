import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TurnstileModule } from 'nestjs-cloudflare-captcha'

import { getTurnstileConfig } from '@/config/loaders/turnstile.config-loader'

import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    AuthModule,
    UsersModule,
    // TurnstileModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: getTurnstileConfig,
    //   inject: [ConfigService],
    // }),
  ],
})
export class ApiModule {}
