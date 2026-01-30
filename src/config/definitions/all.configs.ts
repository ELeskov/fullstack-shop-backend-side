import { AppConfig } from './app.config'
import { MailerConfig } from './mailer.config'
import { S3Config } from './s3.config'
import { TurnstileConfig } from './turnstile.config'

export interface AllConfigs {
  turnstile: TurnstileConfig
  app: AppConfig
  mailer: MailerConfig
  s3: S3Config
}
