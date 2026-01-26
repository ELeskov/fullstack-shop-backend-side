import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { UserRole } from '@prisma/generated/enums'
import { type Request } from 'express'

import { Authorization } from '@/shared/decorators/auth.decorator'
import { Authorized } from '@/shared/decorators/authorized.decorator'

import {
  BadRequestErrorDto,
  ConflictErrorDto,
  ForbiddenErrorDto,
  NotFoundErrorDto,
  UnauthorizedErrorDto,
} from '../../types/error-response.dto'

import { UpdateUserDataDto } from './dto/updateUserData.dto'
import { UserResponseDto } from './dto/userResponse.dto'
import { UsersService } from './users.service'

@ApiTags('users')
@ApiCookieAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @Authorization()
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
    return this.usersService.getMe(userId)
  }

  @Get(':id')
  @Authorization(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получить пользователя по id (только для ADMIN)' })
  @ApiParam({
    name: 'id',
    description: 'ID пользователя',
    example: 'clx123abc...',
  })
  @ApiOkResponse({ description: 'Пользователь найден.' })
  @ApiUnauthorizedResponse({
    description: 'Не авторизован.',
    type: UnauthorizedErrorDto,
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав (требуется роль ADMIN).',
    type: ForbiddenErrorDto,
  })
  @ApiNotFoundResponse({
    description: 'Пользователь с таким id не найден.',
    type: NotFoundErrorDto,
  })
  public async findById(@Param('id') id: string) {
    return this.usersService.findById(id)
  }

  @Patch('me')
  @Authorization(UserRole.REGULAR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Обновление собственных данных пользователя (Имя, Email)',
  })
  @ApiBody({ type: UpdateUserDataDto })
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
  @ApiConflictResponse({
    description: 'Email уже используется',
    type: ConflictErrorDto,
  })
  public async updateOwnUserData(
    @Req() req: Request,
    @Body() dto: UpdateUserDataDto,
  ) {
    return this.usersService.updateUserData(req, dto)
  }
}
