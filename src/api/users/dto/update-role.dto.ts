import { ApiProperty } from '@nestjs/swagger'
import { UserRole } from '@prisma/generated/enums'
import { IsEnum, IsNotEmpty } from 'class-validator'

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Новая роль пользователя',
    enum: UserRole,
    example: UserRole.ADMIN,
  })
  @IsEnum(UserRole)
  @IsNotEmpty({ message: 'Роль не может быть пустой' })
  role!: UserRole
}
