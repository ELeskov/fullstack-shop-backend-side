import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
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
import { User } from '@prisma/generated/client'
import { Request, Response } from 'express'
import { Turnstile } from 'nestjs-cloudflare-captcha'

import { UserResponseDto } from '@/api/auth/account/dto/userResponse.dto'
import { Authorization } from '@/shared/decorators/auth.decorator'
import { Authorized } from '@/shared/decorators/authorized.decorator'
import {
  BadRequestErrorDto,
  ConflictErrorDto,
  NotFoundErrorDto,
  UnauthorizedErrorDto,
} from '@/types/error-response.dto'

import { AccountService } from './account.service'
import { AccountResponseDto } from './dto/account-response.dto'
import { LoginDto } from './dto/login.dto'
import { PatchUserDto } from './dto/patchUser.dto'
import { RegisterDto } from './dto/register.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { SendEmailDto } from './dto/sendEmail.dto'
import { UpdateUserAvatarResponseDto } from './dto/updateAvatarResponse.dto'
import { VerificationTokenDto } from './dto/verificationToken.dto'

@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('@me')
  @Authorization()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
  @ApiOkResponse({
    description: 'Профиль текущего пользователя.',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Не авторизован.',
    type: UnauthorizedErrorDto,
  })
  public async me(@Authorized('id') userId: string) {
    return this.accountService.getMe(userId)
  }

  @Patch('@me')
  @Authorization()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Обновление username пользователя',
  })
  @ApiBody({ type: PatchUserDto })
  @ApiOkResponse({
    description: 'Данные успешно обновлены',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Не авторизован',
    type: UnauthorizedErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректные данные',
    type: BadRequestErrorDto,
  })
  public async patchUser(@Req() req: Request, @Body() dto: PatchUserDto) {
    return this.accountService.patchMe(req, dto)
  }

  @Patch('@me/avatar')
  @HttpCode(HttpStatus.OK)
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Обновление фото аватара',
  })
  @ApiOkResponse({
    description: 'Фото успешно обновлено',
    type: UpdateUserAvatarResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Не авторизован',
    type: UnauthorizedErrorDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  public upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: /\/(jpg|jpeg|png|webp)$/,
          }),
          new MaxFileSizeValidator({
            maxSize: 1000 * 1000 * 10,
            message: 'Можно загружать файлы не больше 10 МБ',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Authorized() user: User,
  ) {
    return this.accountService.changeMeAvatar(user, file)
  }

  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({
    description: 'Успешная регистрация.',
    type: AccountResponseDto,
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
  @Turnstile()
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  public async register(@Req() req: Request, @Body() dto: RegisterDto) {
    return this.accountService.register(req, dto)
  }

  @ApiOperation({ summary: 'Вход' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description:
      'Успешный вход. Может вернуть accessToken в body и/или установить cookie',
    type: AccountResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Ошибка валидации входных данных.',
    type: BadRequestErrorDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Неверные учетные данные.',
    type: UnauthorizedErrorDto,
  })
  @Turnstile()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  public async login(@Req() req: Request, @Body() dto: LoginDto) {
    return this.accountService.login(req, dto)
  }

  @ApiOperation({ summary: 'Выход (logout)' })
  @Authorization()
  @ApiCookieAuth()
  @ApiOkResponse({
    description: 'Сессия завершена. Очистка cookie и инвалидация сессии.',
    type: AccountResponseDto,
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
    return this.accountService.logout(req, res)
  }

  @Post('email/verify')
  @ApiCookieAuth()
  @Authorization()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Подтверждение email по токену',
    description:
      'Подтверждает email пользователя по одноразовому токену из письма. Устанавливает isVerified = true, удаляет токен и создаёт сессию',
  })
  @ApiOkResponse({
    description: 'Email успешно подтверждён. Создана сессия авторизации',
  })
  @ApiBadRequestResponse({
    description: 'Токен истёк или недействителен',
    type: BadRequestErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Токен не найден или пользователь не существует',
    type: NotFoundErrorDto,
  })
  @ApiBody({
    type: VerificationTokenDto,
  })
  public async confirmEmail(@Body() dto: VerificationTokenDto) {
    return this.accountService.confirmEmail(dto)
  }

  @Post('password/reset')
  @ApiCookieAuth()
  @Authorization()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Сброс пароля по токену',
    description:
      'Сбрасывает пароль пользователя по токену из письма восстановления. Обновляет пароль и удаляет токен сброса.',
  })
  @ApiOkResponse({
    description: 'Пароль успешно сброшен',
    schema: {
      type: 'boolean',
      example: true,
    },
  })
  @ApiBadRequestResponse({
    description: 'Токен истёк или недействителен',
    type: BadRequestErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Токен не найден или пользователь не существует',
    type: NotFoundErrorDto,
  })
  @ApiConflictResponse({
    description: 'Пароли не совпадают',
  })
  @ApiBody({
    type: ResetPasswordDto,
    description: 'Токен из письма + новый пароль',
  })
  public async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.accountService.resetPassword(dto, req, res)
  }

  @Post('email/verification/send')
  @ApiCookieAuth()
  @Authorization()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Отправить письмо для подтверждения email',
    description:
      'Отправляет письмо с одноразовым токеном подтверждения на email текущего пользователя.',
  })
  @ApiOkResponse({
    description: 'Письмо отправлено (или переотправлено)',
  })
  @ApiUnauthorizedResponse({
    description: 'Не авторизован',
    type: UnauthorizedErrorDto,
  })
  @ApiBody({
    type: SendEmailDto,
  })
  public async sendVerificationEmail(@Body() dto: SendEmailDto) {
    return this.accountService.sendVerificationToken(dto.email)
  }

  @Post('password/reset/send')
  @ApiCookieAuth()
  @Authorization()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Отправить письмо для сброса пароля',
    description:
      'Отправляет письмо с одноразовым токеном сброса пароля на email текущего пользователя.',
  })
  @ApiOkResponse({
    description: 'Письмо отправлено (или переотправлено)',
  })
  @ApiUnauthorizedResponse({
    description: 'Не авторизован',
    type: UnauthorizedErrorDto,
  })
  @ApiBody({
    type: SendEmailDto,
  })
  public async sendResetPasswordEmail(@Body() dto: SendEmailDto) {
    return this.accountService.sendResetPasswordToken(dto.email)
  }
}
