import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { Request } from 'express'

import { AccountService } from './account.service'
import { AccountDto } from './dto/account.dto'

@ApiTags('account')
@Controller('auth/account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Подтверждение email по токену',
    description:
      'Подтверждает email пользователя по одноразовому токену из письма. Устанавливает isVerified = true, удаляет токен и создаёт сессию',
  })
  @ApiOkResponse({
    description: 'Email успешно подтверждён. Создана сессия авторизации',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'uuid-string' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Токен истёк или недействителен',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example:
            'Токен подтверждения истек. Пожалуйста, запросите новый токен для подтверждения',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Токен не найден или пользователь не существует',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: {
          type: 'string',
          example:
            'Токен подтверждения не найден. Пожалуйста, убедитесь, что у вас правильный токен',
        },
        error: { type: 'string', example: 'Not Found' },
      },
    },
  })
  @ApiBody({
    type: AccountDto,
  })
  public async newVerification(@Req() req: Request, @Body() dto: AccountDto) {
    return this.accountService.newVerification(req, dto)
  }
}
