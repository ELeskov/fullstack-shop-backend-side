import { AppConfig } from './app.config'
import { MailerConfig } from './mailer.config'
import { TurnstileConfig } from './turnstile.config'

export interface AllConfigs {
  turnstile: TurnstileConfig
  app: AppConfig
  mailer: MailerConfig
}
