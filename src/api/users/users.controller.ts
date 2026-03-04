import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common'
import {
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger'
import { UserRole } from '@prisma/generated/enums'

import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator'
import { Authorization } from '@/shared/decorators/auth.decorator'

import { AdminUpdateUserDto } from './dto/admin-update-user.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { UsersService } from './users.service'

@ApiTags('Users')
@ApiCookieAuth()
@Controller('users')
@Authorization(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список всех пользователей' })
  @ApiOkResponse({ description: 'Список пользователей' })
  @ApiCommonErrors()
  public async findAll() {
    return this.usersService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить детальную информацию о пользователе' })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiOkResponse({ description: 'Пользователь найден со всеми связями' })
  @ApiCommonErrors()
  public async findById(@Param('id') id: string) {
    return this.usersService.findById(id)
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Изменить роль пользователя (Повысить/Понизить)' })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiOkResponse({ description: 'Роль успешно изменена' })
  @ApiCommonErrors()
  public async updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.usersService.updateRole(id, dto.role)
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Принудительное редактирование профиля пользователя',
    description:
      'Позволяет админу менять имя, email или сбрасывать аватарку (передав пустую строку).',
  })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiBody({ type: AdminUpdateUserDto })
  @ApiOkResponse({ description: 'Профиль пользователя обновлен' })
  @ApiCommonErrors()
  public async updateProfile(
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.usersService.updateProfileByAdmin(id, dto)
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Жесткое удаление пользователя',
    description:
      'Удаляет пользователя из базы вместе с его магазинами и заказами, а также очищает S3 хранилище.',
  })
  @ApiParam({ name: 'id', description: 'ID пользователя' })
  @ApiOkResponse({ description: 'Пользователь успешно удален', example: true })
  @ApiCommonErrors()
  public async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id)
  }
}
