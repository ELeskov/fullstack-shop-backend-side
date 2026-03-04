import {
  Body,
  Controller,
  Delete,
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
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { User } from '@prisma/generated/client'
import { Request, Response } from 'express'
import { Turnstile } from 'nestjs-cloudflare-captcha'

import { UserResponseDto } from '@/api/auth/account/dto/userResponse.dto'
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator'
import { Authorization } from '@/shared/decorators/auth.decorator'
import { Authorized } from '@/shared/decorators/authorized.decorator'

import { AccountService } from './account.service'
import { AccountResponseDto } from './dto/account-response.dto'
import { LoginDto } from './dto/login.dto'
import { PatchUserDto } from './dto/patchUser.dto'
import { RegisterDto } from './dto/register.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { SendEmailDto } from './dto/sendEmail.dto'
import { UpdateUserAvatarResponseDto } from './dto/updateAvatarResponse.dto'
import { VerificationTokenDto } from './dto/verificationToken.dto'

@ApiTags('Accounts')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({
    description: 'Успешная регистрация.',
    type: AccountResponseDto,
  })
  @ApiCreatedResponse({
    description: 'Пользователь зарегистрирован',
  })
  @ApiCommonErrors()
  @Turnstile()
  @HttpCode(HttpStatus.CREATED)
  public async register(@Req() req: Request, @Body() dto: RegisterDto) {
    return this.accountService.register(req, dto)
  }

  @Post('login')
  @ApiOperation({ summary: 'Вход' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description:
      'Успешный вход. Может вернуть accessToken в body и/или установить cookie',
    type: AccountResponseDto,
  })
  @ApiCommonErrors()
  @Turnstile()
  public async login(@Req() req: Request, @Body() dto: LoginDto) {
    return this.accountService.login(req, dto)
  }

  @Post('logout')
  @ApiOperation({ summary: 'Выход (logout)' })
  @Authorization()
  @ApiCookieAuth()
  @ApiOkResponse({
    description: 'Сессия завершена. Очистка cookie и инвалидация сессии.',
    type: AccountResponseDto,
  })
  @ApiCommonErrors()
  public async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.accountService.logout(req, res)
  }

  @Post('email/verify')
  @ApiCookieAuth()
  @Authorization()
  @ApiOperation({
    summary: 'Подтверждение email по токену',
    description:
      'Подтверждает email пользователя по одноразовому токену из письма. Устанавливает isVerified = true, удаляет токен и создаёт сессию',
  })
  @ApiOkResponse({
    description: 'Email успешно подтверждён. Создана сессия авторизации',
  })
  @ApiCommonErrors()
  @ApiBody({
    type: VerificationTokenDto,
  })
  public async confirmEmail(@Body() dto: VerificationTokenDto) {
    return this.accountService.confirmEmail(dto)
  }

  @Post('password/reset')
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
  @ApiCommonErrors()
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
  @ApiOperation({
    summary: 'Отправить письмо для подтверждения email',
    description:
      'Отправляет письмо с одноразовым токеном подтверждения на email текущего пользователя.',
  })
  @ApiOkResponse({
    description: 'Письмо отправлено (или переотправлено)',
  })
  @ApiCommonErrors()
  @ApiBody({
    type: SendEmailDto,
  })
  public async sendVerificationEmail(@Body() dto: SendEmailDto) {
    return this.accountService.sendVerificationToken(dto.email)
  }

  @Post('password/reset/send')
  @ApiOperation({
    summary: 'Отправить письмо для сброса пароля',
    description:
      'Отправляет письмо с одноразовым токеном сброса пароля на email текущего пользователя.',
  })
  @ApiOkResponse({
    description: 'Письмо отправлено',
  })
  @ApiCommonErrors()
  @ApiBody({
    type: SendEmailDto,
  })
  public async sendResetPasswordEmail(@Body() dto: SendEmailDto) {
    return this.accountService.sendResetPasswordToken(dto.email)
  }

  @Get('@me')
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
  @ApiOkResponse({
    description: 'Профиль текущего пользователя.',
    type: UserResponseDto,
  })
  @ApiCommonErrors()
  public async me(@Authorized('id') userId: string) {
    return this.accountService.getProfile(userId)
  }

  @Patch('@me')
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Обновление username пользователя',
  })
  @ApiBody({ type: PatchUserDto })
  @ApiOkResponse({
    description: 'Данные успешно обновлены',
    type: UserResponseDto,
  })
  @ApiCommonErrors()
  public async updateProfile(
    @Authorized('id') userId: string,
    @Body() dto: PatchUserDto,
  ) {
    return this.accountService.updateProfile(userId, dto)
  }

  @Patch('@me/avatar')
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Обновление фото аватара',
  })
  @ApiOkResponse({
    description: 'Фото успешно обновлено',
    type: UpdateUserAvatarResponseDto,
  })
  @ApiCommonErrors()
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
    return this.accountService.updateAvatar(user, file)
  }

  @Delete('@me')
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Удаление аккаунта',
  })
  @ApiOkResponse({
    description: 'Пользователь успешно удален',
    example: true,
  })
  @ApiCommonErrors()
  public delete(@Authorized('id') userId: string) {
    return this.accountService.delete(userId)
  }
}
