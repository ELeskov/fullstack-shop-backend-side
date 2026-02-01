import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class PatchUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Имя пользователя, отображаемое в системе.',
  })
  @IsString({ message: 'Имя должно быть строкой.' })
  @IsNotEmpty({ message: 'Имя обязательно для заполнения.' })
  firstName!: string
}
