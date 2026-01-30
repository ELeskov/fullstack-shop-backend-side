import { registerAs } from '@nestjs/config'

import { validateEnv } from '@/shared/utils/validate-env'

import { S3Config } from '../definitions/s3.config'
import { S3Validator } from '../validator/s3.validator'

export const s3Env = registerAs<S3Config>('s3', () => {
  validateEnv(process.env, S3Validator)

  return {
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  bucketName: process.env.S3_BUCKET_NAME,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  }
})
