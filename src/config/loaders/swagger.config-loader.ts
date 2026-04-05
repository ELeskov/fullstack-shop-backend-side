import { DocumentBuilder } from '@nestjs/swagger'

export function getSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Marketplace API')
    .setDescription('API documentation for Marketplace')
    .setVersion('1.0')
    .setContact('eleskov', 'https://github.com/ELeskov', 'eleskoov@mail.ru')
    .build()
}
