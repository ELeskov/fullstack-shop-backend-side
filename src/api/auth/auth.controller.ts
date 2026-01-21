import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { type Request, type Response } from 'express'

import {
  BadRequestErrorDto,
  ConflictErrorDto,
  NotFoundErrorDto,
  UnauthorizedErrorDto,
} from '../../types/error-response.dto'

import { AuthService } from './auth.service'
import { AuthResponseDto } from './dto/auth-response.dto'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({
    description: 'Успешная регистрация.',
    type: AuthResponseDto,
  })
  @ApiCreatedResponse({
    description: 'Пользователь зарегистрирован',
  })
  @ApiBadRequestResponse({
    description: 'Ошибка валидации входных данных.',
    type: BadRequestErrorDto,
  })
  @ApiConflictResponse({
    description: 'Пользователь с такой почтой уже существует',
    type: ConflictErrorDto,
  })
  @ApiNotFoundResponse({
    description:
      'Пользователь не найден. Пожалуйста проверьте введенные данные',
    type: NotFoundErrorDto,
  })
  // @Turnstile()
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  public async register(@Req() req: Request, @Body() dto: RegisterDto) {
    return this.authService.register(req, dto)
  }

  @ApiOperation({ summary: 'Вход (логин)' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description:
      'Успешный вход. Может вернуть accessToken в body и/или установить cookie',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Ошибка валидации входных данных.',
    type: BadRequestErrorDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Неверные учетные данные.',
    type: UnauthorizedErrorDto,  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  public async login(@Req() req: Request, @Body() dto: LoginDto) {
    return this.authService.login(req, dto)
  }

  @ApiOperation({ summary: 'Выход (logout)' })
  @ApiCookieAuth()
  @ApiOkResponse({
    description: 'Сессия завершена. Очистка cookie и инвалидация сессии.',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Нет валидной сессии для выхода.',
    type: UnauthorizedErrorDto,
  })
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  public async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(req, res)
  }
}
