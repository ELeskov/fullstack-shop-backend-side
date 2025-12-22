import { registerAs } from '@nestjs/config'

import { validateEnv } from '@/shared/utils/validate-env'

import { AppConfig } from '../definitions/app.config'
import { AppValidator } from '../validator/app.validator'

export const appEnv = registerAs<AppConfig>('app', () => {
  validateEnv(process.env, AppValidator)

  return {
    nodeEnv: process.env.NODE_ENV,
    port: Number(process.env.APPLICATION_PORT),
    // host: process.env.HTTP_HOST,
    // corsOrigin: process.env.HTTP_CORS,
  }
})
