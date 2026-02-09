import { ApiProperty } from '@nestjs/swagger'

export class UploadLogoShopRequestDto {
  @ApiProperty()
  path?: string
}
