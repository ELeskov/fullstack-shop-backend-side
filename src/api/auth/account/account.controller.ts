import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Request } from 'express'

import { AccountService } from './account.service'
import { AccountDto } from './dto/account.dto'

@ApiTags('Account')
@Controller('auth/account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  public async newVerification(@Req() req: Request, @Body() dto: AccountDto) {
    return this.accountService.newVerification(req, dto)
  }
}
