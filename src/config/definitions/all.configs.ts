import { YookassaConfig } from '@/config/definitions/yookassa.config'

import { AppConfig } from './app.config'
import { MailerConfig } from './mailer.config'
import { S3Config } from './s3.config'
import { TurnstileConfig } from './turnstile.config'

export interface AllConfigs {
  app: AppConfig
  turnstile: TurnstileConfig
  s3: S3Config
  mailer: MailerConfig
  yookassa: YookassaConfig
}
