import { ConfigService } from '@nestjs/config'
import type { YookassaModuleOptions } from 'nestjs-yookassa'

import { AllConfigs } from '../definitions/all.configs'

export function getYookassaConfig(
  configService: ConfigService<AllConfigs>,
): YookassaModuleOptions {
  return {
    shopId: configService.getOrThrow<string>('yookassa.shopId', {
      infer: true,
    }),
    apiKey: configService.getOrThrow<string>('yookassa.secretKey', {
      infer: true,
    }),
  }
}
