import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import 'multer'

import { ApiModule } from '@/api/api.module'

import { appEnv } from './config/env/app.env'
import { mailerEnv } from './config/env/mailer.env'
import { s3Env } from './config/env/s3.env'
import { turnstileEnv } from './config/env/turnstile.env'
import { InfraModule } from './infra/infra.module'
import { MailModule } from './libs/mail/mail.module'
import { IS_DEV_ENV } from './shared/utils/is-dev.util'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: !IS_DEV_ENV,
      load: [appEnv, mailerEnv, turnstileEnv, s3Env],
    }),
    InfraModule,
    ApiModule,
    MailModule,
  ],
})
export class AppModule {}
