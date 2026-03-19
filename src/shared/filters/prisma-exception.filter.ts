import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Prisma } from '@prisma/generated/client'
import type { Request, Response } from 'express'

import { ApiErrorCode } from '@/shared/types/api-error-response.dto'

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name)

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Внутренняя ошибка базы данных'
    let code = ApiErrorCode.INTERNAL

    switch (exception.code) {
      case 'P2000': {
        status = HttpStatus.BAD_REQUEST
        code = ApiErrorCode.VALIDATION_FAILED
        const column = exception.meta?.column_name as string
        message = column
          ? `Введенные данные слишком длинные для поля: ${column}`
          : 'Введенные данные слишком длинные'
        break
      }

      case 'P2002': {
        status = HttpStatus.CONFLICT
        code = ApiErrorCode.CONFLICT
        const target = exception.meta?.target as string[] | string
        message = target
          ? `Запись с таким значением уже существует. Поле: ${Array.isArray(target) ? target.join(', ') : target}`
          : 'Запись с такими данными уже существует'
        break
      }

      case 'P2025': {
        status = HttpStatus.NOT_FOUND
        code = ApiErrorCode.NOT_FOUND
        message = (exception.meta?.cause as string) || 'Запись не найдена'
        break
      }

      case 'P2024': {
        status = HttpStatus.BAD_REQUEST
        code = ApiErrorCode.VALIDATION_FAILED
        message = 'Предоставлен неверный аргумент'
        break
      }
    }

    this.logger.error(
      `${request.method} ${request.url} Prisma Error ${exception.code}: ${message}`,
      exception.stack,
    )

    response.status(status).json({
      statusCode: status,
      error: 'Database Error',
      message,
      code,
      path: request.url,
      timestamp: new Date().toISOString(),
    })
  }
}
