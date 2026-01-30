import { IsString } from 'class-validator'

export class S3Validator {
  @IsString()
  public S3_REGION!: string

  @IsString()
  public S3_ENDPOINT!: string

  @IsString()
  public S3_BUCKET_NAME!: string

  @IsString()
  public S3_ACCESS_KEY_ID!: string

  @IsString()
  public S3_SECRET_ACCESS_KEY!: string
}
