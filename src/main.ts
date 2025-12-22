import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { RedisStore } from 'connect-redis'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import { createClient } from 'redis'

import { AppModule } from './app.module.js'
import { ms, StringValue } from './shared/utils/ms.util.js'
import { parseBoolean } from './shared/utils/parse-boolean.util.js'
import { setupSwagger } from './shared/utils/swagger.util.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const config = app.get(ConfigService)

  app.setGlobalPrefix('api')

  const redisClient = createClient({
    url: config.getOrThrow<string>('REDIS_URI'),
  })

  await redisClient.connect().catch(() => {
    process.exit(1)
  })

  app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')))

  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  app.use(
    session({
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      name: config.getOrThrow<string>('SESSION_NAME'),
      resave: true,
      saveUninitialized: false,
      cookie: {
        domain: config.getOrThrow<string>('SESSION_DOMAIN'),
        maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
        httpOnly: parseBoolean(
          config.getOrThrow<StringValue>('SESSION_HTTP_ONLY'),
        ),
        secure: parseBoolean(config.getOrThrow<StringValue>('SESSION_SECURE')),
        sameSite: 'lax',
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
