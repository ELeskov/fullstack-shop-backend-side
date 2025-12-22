import { INestApplication } from '@nestjs/common'
import { SwaggerModule } from '@nestjs/swagger'

import { getSwaggerConfig } from '../../config/loaders/swagger.config.js'

export function setupSwagger(app: INestApplication) {
  const document = SwaggerModule.createDocument(app, getSwaggerConfig())

  SwaggerModule.setup('/docs', app, document, {
    swaggerOptions: { withCredentials: true },
    jsonDocumentUrl: '/docs/json',
  })
}
