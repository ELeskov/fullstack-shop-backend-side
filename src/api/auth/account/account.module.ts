import { forwardRef, Module } from '@nestjs/common'

import { UsersService } from '@/api/users/users.service'
import { MailModule } from '@/libs/mail/mail.module'
import { MailService } from '@/libs/mail/mail.service'

import { AuthModule } from '../auth.module'

import { AccountController } from './account.controller'
import { AccountService } from './account.service'

@Module({
  imports: [MailModule, forwardRef(() => AuthModule)],
  controllers: [AccountController],
  providers: [AccountService, UsersService, MailService],
  exports: [AccountService],
})
export class AccountModule {}
