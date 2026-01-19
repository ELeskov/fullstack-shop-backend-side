import { ConfigService } from '@nestjs/config'
import type { TurnstileOptions } from 'nestjs-cloudflare-captcha'

import { isDev } from '@/shared/utils/is-dev.util'

import { AllConfigs } from '../definitions/all.configs'

export function getTurnstileConfig(
  configService: ConfigService<AllConfigs>,
): TurnstileOptions {
  return {
    secretKey: configService.get('turnstile.secretKey', {
      infer: true,
    }),
    token: req => req.body.captcha,
    skipIf: isDev(configService),
  }
}
