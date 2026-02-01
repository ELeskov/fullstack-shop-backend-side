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

import {
  ForbiddenErrorDto,
  NotFoundErrorDto,
  UnauthorizedErrorDto,
} from '../../types/error-response.dto'

import { UsersService } from './users.service'

@ApiCookieAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
}
