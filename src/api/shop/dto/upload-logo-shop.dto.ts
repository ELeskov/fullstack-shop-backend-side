import { ApiProperty } from '@nestjs/swagger'

export class UploadLogoShopDto {
  @ApiProperty()
  file!: FormData
}
