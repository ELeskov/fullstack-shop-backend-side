import { ConfigService } from '@nestjs/config'
import * as dotenv from 'dotenv'

import { AllConfigs } from '@/config/definitions/all.configs'
import { Environment } from '@/config/validator/app.validator'

dotenv.config()

export const isDev = (configService: ConfigService<AllConfigs>) =>
  configService.get('app.nodeEnv', { infer: true }) === Environment.Development

export const IS_DEV_ENV = process.env.NODE_ENV === Environment.Development
