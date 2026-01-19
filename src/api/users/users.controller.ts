import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common'
import {
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

import { Authorization } from '@/shared/decorators/auth.decorator'
import { Authorized } from '@/shared/decorators/authorized.decorator'

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
  })
  @ApiUnauthorizedResponse({
    description: 'Не авторизован.',
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
    description: 'Не авторизован (нет/невалидный токен).',
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав (требуется роль ADMIN).',
  })
  @ApiNotFoundResponse({ description: 'Пользователь с таким id не найден.' })
  public async findById(@Param('id') id: string) {
    return this.usersService.findById(id)
  }
}
