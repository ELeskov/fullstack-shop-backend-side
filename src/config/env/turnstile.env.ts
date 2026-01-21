import { registerAs } from '@nestjs/config'

import { validateEnv } from '@/shared/utils/validate-env'

import { TurnstileConfig } from '../definitions/turnstile.config'
import { TurnstileValidator } from '../validator/turnstile.validator'

export const turnstileEnv = registerAs<TurnstileConfig>('turnstile', () => {
  validateEnv(process.env, TurnstileValidator)

  const secretKey = process.env.CAPTCHA_SECRET_KEY
  if (!secretKey) {
    throw new Error('CAPTCHA_SECRET_KEY is not set')
  }

  return {
    secretKey,
  }
})
