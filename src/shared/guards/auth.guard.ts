import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { Request } from 'express'

import { PrismaService } from '@/infra/prisma/prisma.service'

/**
 * Guard для проверки ролей пользователя.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(private readonly prismaService: PrismaService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()

    if (typeof request.session.userId === 'undefined') {
      throw new UnauthorizedException(
        'Пользователь не авторизован. Пожалуйста, войдите в систему, чтобы получить доступ',
      )
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        id: request.session.userId,
      },
      omit: {
        password: true,
      },
    })

    if (!user) {
      throw new NotFoundException('Пользователь не найден')
    }

    request.user = user

    return true
  }
}
