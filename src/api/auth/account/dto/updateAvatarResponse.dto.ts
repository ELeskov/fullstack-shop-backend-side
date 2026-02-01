import { ApiProperty } from '@nestjs/swagger'

export class UpdateUserAvatarResponseDto {
  @ApiProperty({
    example:
      'https://4f35f4d0-2fb4974b-6046-4608-bcaa-2df25d95c300.s3.timeweb.cloud/avatars/1769796648317-zkv4xtz0vk-eleskov.png',
    description: 'Ссылка на автар пользователя',
  })
  url!: string
}
