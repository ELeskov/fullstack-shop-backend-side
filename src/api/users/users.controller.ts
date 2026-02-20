import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger'
import { UserRole } from '@prisma/generated/enums'

import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator'
import { Authorization } from '@/shared/decorators/auth.decorator'

import { UsersService } from './users.service'

@ApiCookieAuth()
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
  @ApiCommonErrors()
  public async findById(@Param('id') id: string) {
    return this.usersService.findById(id)
  }
}
