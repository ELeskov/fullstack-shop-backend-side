import type { MailerOptions } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'

import { AllConfigs } from '../definitions/all.configs'

export function getMailerConfig(
  configService: ConfigService<AllConfigs>,
): MailerOptions {
  return {
    transport: {
      host: configService.get('mailer.host', { infer: true }),
      port: configService.get('mailer.port', { infer: true }),
      secure: true,
      auth: {
        user: configService.get('mailer.login', { infer: true }),
        pass: configService.get('mailer.password', { infer: true }),
      },
    },
    defaults: {
      from: `"ELeskov Team" noreply@eleskov.ru`,
    },
  }
}
