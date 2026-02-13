import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Request, Response } from 'express'

import { ApiErrorCode } from '@/shared/types/api-error-response.dto'

type HttpExceptionBody = {
  message?: string | string[]
  error?: string
  statusCode?: number
  code?: ApiErrorCode
  details?: Record<string, string[]>
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<Response>()
    const req = ctx.getRequest<Request>()

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const responseBody =
      exception instanceof HttpException ? exception.getResponse() : null

    const bodyObj: HttpExceptionBody =
      typeof responseBody === 'object' && responseBody !== null
        ? responseBody
        : {}

    const rawMsg =
      typeof responseBody === 'string' ? responseBody : bodyObj.message

    const message = Array.isArray(rawMsg)
      ? rawMsg.join(', ')
      : String(rawMsg ?? 'Неизвестная ошибка')

    const errorText =
      bodyObj.error ??
      (status === 400 ? 'Bad Request' : (HttpStatus[status] ?? 'Error'))

    const code: ApiErrorCode =
      bodyObj.code ??
      (status === 400
        ? ApiErrorCode.VALIDATION_FAILED
        : status === 401
          ? ApiErrorCode.UNAUTHORIZED
          : status === 403
            ? ApiErrorCode.FORBIDDEN
            : status === 404
              ? ApiErrorCode.NOT_FOUND
              : status === 409
                ? ApiErrorCode.CONFLICT
                : ApiErrorCode.INTERNAL)

    const details = bodyObj.details

    res.status(status).json({
      statusCode: status,
      error: errorText,
      message,
      code,
      details,
      path: req.url,
      timestamp: new Date().toISOString(),
    })
  }
}
