import { AppConfig } from './app.config'
import { TurnstileConfig } from './turnstile.config'

export interface AllConfigs {
  turnstile: TurnstileConfig
  app: AppConfig
}
