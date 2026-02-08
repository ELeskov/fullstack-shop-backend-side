import { IsString } from 'class-validator'

export class CreateShopDto {
  @IsString()
  title!: string

  @IsString()
  description!: string

  @IsString()
  picture!: string
}
