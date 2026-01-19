import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/generated/client'
import { AuthMethod } from '@prisma/generated/enums'
import { verify } from 'argon2'
import { type Request, type Response } from 'express'

import { PrismaService } from '@/infra/prisma/prisma.service'

import { UsersService } from '../users/users.service'

import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {}

  public async register(req: Request, dto: RegisterDto) {
    const isExists = await this.userService.findByEmail(dto.email)

    if (isExists) {
      throw new ConflictException('Пользователь с такой почтой уже существует')
    }

    const user = await this.userService.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      method: AuthMethod.CREDENTIALS,
      picture: '',
    })

    return await this.saveSession(req, user)
  }

  public async login(req: Request, dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email)

    if (!user || !user.password) {
      throw new NotFoundException(
        'Пользователь не найден. Пожалуйста проверьте введенные данные',
      )
    }

    const isValidPassword = await verify(user.password, dto.password)

    if (!isValidPassword) {
      throw new NotFoundException(
        'Пользователь не найден. Пожалуйста проверьте введенные данные',
      )
    }

    return this.saveSession(req, user)
  }

  public async logout(req: Request, res: Response) {
    return new Promise((resolve, reject) => {
      req.session.destroy(err => {
        if (err) {
          return reject(
            new InternalServerErrorException(
              'Не удалось завершить сессию. Возможно возникла проблема с сервером или сессия уже была завершена.',
            ),
          )
        }
        res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'))
        resolve(true)
      })
    })
  }

  public async saveSession(req: Request, user: User) {
    return new Promise((resolve, reject) => {
      req.session.userId = user.id

      req.session.save(err => {
        if (err) {
          return reject(
            new InternalServerErrorException(
              'Не удалось сохранить сессию. Проверьте правильно ли настроены параметры сессии',
            ),
          )
        }

        resolve({ userId: user.id })
      })
    })
  }
}
