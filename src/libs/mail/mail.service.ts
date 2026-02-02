import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { render } from '@react-email/components'

import { VerificationTemplate } from './templates/email-verification.template'
import { ResetPasswordTemplate } from './templates/password-reset.template'

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  public async sendVerificationEmail(email: string, token: string) {
    const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
    const template = await render(VerificationTemplate({ domain, token }))

    return this.sendMail(email, 'Подтверждение почты', template)
  }

  public async sendResetPasswordEmail(email: string, token: string) {
    const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGIN')
    const template = await render(ResetPasswordTemplate({ domain, token }))

    return this.sendMail(email, 'Сброс пароля', template)
  }

  private sendMail(email: string, subject: string, html: string) {
    return this.mailerService.sendMail({
      to: email,
      subject,
      html,
    })
  }
}
