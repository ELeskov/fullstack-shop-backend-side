import { forwardRef, Module } from '@nestjs/common'

import { MailService } from '@/libs/mail/mail.service'

import { UsersService } from '../users/users.service'

import { AccountModule } from './account/account.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  imports: [forwardRef(() => AccountModule)],
  controllers: [AuthController],
  providers: [AuthService, UsersService, MailService],
  exports: [AuthService],
})
export class AuthModule {}
