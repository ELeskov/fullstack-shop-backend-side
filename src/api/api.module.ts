import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TurnstileModule } from 'nestjs-cloudflare-captcha'

import { getTurnstileConfig } from '@/config/loaders/turnstile.config-loader'
import { MailModule } from '@/libs/mail/mail.module'

import { AccountModule } from './auth/account/account.module'
import { CategoryModule } from './category/category.module'
import { ColorModule } from './color/color.module'
import { S3Module } from './s3/s3.module'
import { ShopModule } from './shop/shop.module'
import { UsersModule } from './users/users.module'
import { ProductModule } from './product/product.module';
import { BasketModule } from './basket/basket.module';

@Module({
  imports: [
    ShopModule,
    UsersModule,
    AccountModule,
    MailModule,
    S3Module,
    CategoryModule,
    TurnstileModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTurnstileConfig,
      inject: [ConfigService],
    }),
    ColorModule,
    ProductModule,
    BasketModule,
  ],
})
export class ApiModule {}
