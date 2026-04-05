import { registerAs } from '@nestjs/config'

import { YookassaConfig } from '@/config/definitions/yookassa.config'
import { YookassaValidator } from '@/config/validator/yookassa.validator'
import { validateEnv } from '@/shared/utils/validate-env'

export const yookassaEnv = registerAs<YookassaConfig>('yookassa', () => {
  validateEnv(process.env, YookassaValidator)

  const secretKey = process.env.YOOKASSA_SECRET_KEY
  
  if (!secretKey) {
    throw new Error('YOOKASSA_SECRET_KEY is not set')
  }

  return {
    secretKey,
    shopId: process.env.YOOKASSA_SHOP_ID,
  }
})
