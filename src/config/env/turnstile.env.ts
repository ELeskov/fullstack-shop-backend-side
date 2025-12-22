import { registerAs } from '@nestjs/config'

import { validateEnv } from '@/shared/utils/validate-env'

import { TurnstileConfig } from '../definitions/turnstile.config'
import { TurnstileValidator } from '../validator/turnstile.validator'

export const turnstileEnv = registerAs<TurnstileConfig>('turnstile', () => {
  validateEnv(process.env, TurnstileValidator)

  return {
    secretKey: process.env.CAPTCHA_SECRET_KEY,
  }
})
