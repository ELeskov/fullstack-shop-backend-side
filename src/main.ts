import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { RedisStore } from 'connect-redis'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import { createClient } from 'redis'

import { AppModule } from '@/app.module'
import { ApiErrorCode } from '@/shared/types/api-error-response.dto'
import { isDev } from '@/shared/utils/is-dev.util'
import { ms, StringValue } from '@/shared/utils/ms.util'
import { parseBoolean } from '@/shared/utils/parse-boolean.util'
import { setupSwagger } from '@/shared/utils/swagger.util'

import { ApiExceptionFilter } from './shared/filters/api-exception.filter'
import { PrismaClientExceptionFilter } from './shared/filters/prisma-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const config = app.get(ConfigService)
  const { httpAdapter } = app.get(HttpAdapterHost)

  app.setGlobalPrefix('api')

  const redisClient = createClient({
    url: config.getOrThrow<string>('REDIS_URI'),
  })

  await redisClient.connect().catch(err => {
    console.error('❌ Failed to connect to Redis:', err)
    process.exit(1)
  })

  app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')))

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: errors => {
        const details: Record<string, string[]> = {}

        for (const e of errors) {
          if (e.constraints) {
            details[e.property] = Object.values(e.constraints)
          }
        }

        return new BadRequestException({
          message: 'Validation failed',
          code: ApiErrorCode.VALIDATION_FAILED,
          details,
        })
      },
    }),
  )

  app.useGlobalFilters(
    new ApiExceptionFilter(),
    new PrismaClientExceptionFilter(httpAdapter),
  )

  app.use(
    session({
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      name: config.getOrThrow<string>('SESSION_NAME'),
      resave: true,
      saveUninitialized: false,
      cookie: {
        maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
        httpOnly: parseBoolean(
          config.getOrThrow<StringValue>('SESSION_HTTP_ONLY'),
        ),
        secure: parseBoolean(config.getOrThrow<StringValue>('SESSION_SECURE')),
        sameSite: !isDev(config) ? 'none' : 'lax',
      },
      store: new RedisStore({
        client: redisClient,
        prefix: config.getOrThrow<StringValue>('SESSION_FOLDER'),
      }),
    }),
  )

  app.enableCors({
    origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
    credentials: true,
    exposedHeaders: ['set-cookie'],
  })

  setupSwagger(app)

  await app.listen(config.getOrThrow<string>('APPLICATION_PORT'))
}
void bootstrap()
