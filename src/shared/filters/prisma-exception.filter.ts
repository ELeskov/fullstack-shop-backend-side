import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Prisma } from '@prisma/generated/client'
import type { Request, Response } from 'express'

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name)

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Внутренняя ошибка базы данных'

    switch (exception.code) {
      case 'P2000': {
        status = HttpStatus.BAD_REQUEST
        const column = exception.meta?.column_name as string
        message = column
          ? `Введенные данные слишком длинные для поля: ${column}`
          : 'Введенные данные слишком длинные'
        break
      }

      case 'P2002': {
        status = HttpStatus.CONFLICT
        const target = exception.meta?.target as string[] | string

        if (target) {
          const fields = Array.isArray(target) ? target.join(', ') : target
          message = `Запись с таким значением уже существует. Поле: ${fields}`
        } else {
          message = 'Запись с такими данными уже существует'
        }
        break
      }

      case 'P2025': {
        status = HttpStatus.NOT_FOUND
        const cause = exception.meta?.cause as string
        message = cause || 'Запись не найдена в базе данных'
        break
      }
    }

    this.logger.error(
      `${request.method} ${request.url} - Prisma Error ${exception.code}: ${message}`,
      exception.stack,
    )

    response.status(status).json({
      statusCode: status,
      message: message,
      error: exception.name,
      path: request.url,
    })
  }
}
