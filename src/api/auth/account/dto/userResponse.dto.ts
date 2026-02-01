import { ApiProperty } from '@nestjs/swagger'
import { AuthMethod, UserRole } from '@prisma/generated/enums'
import { IsOptional } from 'class-validator'

export class UserResponseDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  name!: string

  @ApiProperty()
  email!: string

  @ApiProperty()
  @IsOptional()
  picture?: string

  @ApiProperty({
    enum: UserRole,
    enumName: 'UserRole',
    example: UserRole.REGULAR,
  })
  role!: UserRole

  @ApiProperty()
  isVerified!: boolean

  @ApiProperty()
  isTwoFactorEnable!: boolean

  @ApiProperty({
    enum: AuthMethod,
    enumName: 'AuthMethod',
    example: AuthMethod.CREDENTIALS,
  })
  method!: AuthMethod

  @ApiProperty()
  createdAt!: string

  @ApiProperty()
  updatedAt!: string
}
