import { registerAs } from '@nestjs/config'

import { validateEnv } from '@/shared/utils/validate-env'

import { MailerConfig } from '../definitions/mailer.config'
import { MailerValidator } from '../validator/mailer.validator'

export const mailerEnv = registerAs<MailerConfig>('mailer', () => {
  validateEnv(process.env, MailerValidator)

  return {
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    login: process.env.MAIL_LOGIN,
    from: String(process.env.MAIL_FROM),
    password: process.env.MAIL_PASSWORD,
  }
})
