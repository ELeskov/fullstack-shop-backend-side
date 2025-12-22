import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Request } from 'express'

import { UsersService } from '@/api/users/users.service'

/**
 * Guard для проверки ролей пользователя.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(private readonly userService: UsersService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()

    if (typeof request.session.userId === 'undefined') {
      throw new UnauthorizedException(
        'Пользователь не авторизован. Пожалуйста, войдите в систему, чтобы получить доступ',
      )
    }

    const user = await this.userService.findById(request.session.userId)

    request.user = user

    return true
  }
}
