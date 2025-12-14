import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { ApiModule } from '@/api/api.module'

import { InfraModule } from './infra/infra.module'
import { IS_DEV_ENV } from './shared/utils/is-dev.util'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: !IS_DEV_ENV }),
    InfraModule,
    ApiModule,
  ],
})
export class AppModule {}
