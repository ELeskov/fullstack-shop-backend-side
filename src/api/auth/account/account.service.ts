import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/generated/client'
import { AuthMethod, TokenType } from '@prisma/generated/enums'
import { hash, verify } from 'argon2'
import { Request, Response } from 'express'
import { v4 as uuidV4 } from 'uuid'

import { S3Service } from '@/api/s3/s3.service'
import { UsersService } from '@/api/users/users.service'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { MailService } from '@/libs/mail/mail.service'
import { S3_NAME_FOLDERS } from '@/shared/consts'
import { ApiErrorCode } from '@/shared/types/api-error-response.dto'
import { extractKeyFromUrl } from '@/shared/utils/extractionKeyFromUrl'

import { LoginDto } from './dto/login.dto'
import { PatchUserDto } from './dto/patchUser.dto'
import { RegisterDto } from './dto/register.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { VerificationTokenDto } from './dto/verificationToken.dto'

@Injectable()
export class AccountService {
  public constructor(
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
  ) {}

  public async getMe(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      omit: {
        password: true,
      },
    })

    if (!user) {
      throw new NotFoundException('Пользователь не найден')
    }

    return user
  }

  public async patchMe(req: Request, dto: PatchUserDto) {
    const userId = req.session.userId

    const existingUser = await this.prismaService.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      throw new NotFoundException('Пользователь не найден')
    }

    const updatedUser = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        name: dto.firstName,
      },
      include: {
        accounts: true,
        orders: true,
        shops: true,
        favorites: true,
      },
      omit: {
        password: true,
      },
    })

    return updatedUser
  }

  public async changeMeAvatar(user: User, file: Express.Multer.File) {
    const { path } = await this.s3Service.upload(
      S3_NAME_FOLDERS.S3_USER_AVATAR,
      file,
    )

    if (user.picture) {
      const key = extractKeyFromUrl(user.picture)
      await this.s3Service.delete(key)
    }

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        picture: path,
      },
    })

    return { url: path }
  }

  public async register(req: Request, dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email)

    if (existingUser) {
      throw new ConflictException('Пользователь с такой почтой уже существует')
    }

    const user = await this.prismaService.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: await hash(dto.password),
        method: AuthMethod.CREDENTIALS,
        picture: '',
      },
    })

    return this.saveSession(req, user)
  }

  public async login(req: Request, dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email)
    if (!user || !user.password) {
      throw new NotFoundException({
        message: 'Пользователь не найден',
        code: ApiErrorCode.NOT_FOUND,
      })
    }

    const isValidPassword = await verify(user.password, dto.password)

    if (!isValidPassword) {
      throw new NotFoundException({
        message: 'Пользователь не найден',
        code: ApiErrorCode.NOT_FOUND,
      })
    }

    return this.saveSession(req, user)
  }

  public async logout(req: Request, res: Response) {
    return new Promise((resolve, reject) => {
      req.session.destroy(err => {
        if (err) {
          return reject(
            new InternalServerErrorException(
              'Ошибка, при попытке выйти из аккаунта',
            ),
          )
        }
        res.clearCookie(this.configService.getOrThrow('SESSION_NAME'))

        resolve(true)
      })
    })
  }

  public async confirmEmail(dto: VerificationTokenDto) {
    const token = await this.verifyToken(dto, TokenType.VERIFICATION)
    const user = await this.prismaService.user.findUnique({
      where: { email: token.email },
    })

    if (!user) {
      throw new NotFoundException('Пользователь не найден')
    }

    await this.prismaService.$transaction(async tx => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
        },
      })
      await tx.token.deleteMany({
        where: { email: token.email, type: TokenType.VERIFICATION },
      })
    })

    return true
  }

  public async resetPassword(
    dto: ResetPasswordDto,
    req: Request,
    res: Response,
  ) {
    const token = await this.verifyToken(dto, TokenType.PASSWORD_RESET)
    const user = await this.prismaService.user.findUnique({
      where: { email: token.email },
    })

    if (!user) {
      throw new NotFoundException('Пользователь не найден')
    }

    if (dto.password !== dto.confirmPassword) {
      throw new ConflictException('Пароли не совпадают')
    }

    await this.prismaService.$transaction(async tx => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          password: await hash(dto.password),
        },
      })
      await tx.token.deleteMany({
        where: { email: token.email, type: TokenType.PASSWORD_RESET },
      })
    })

    await this.logout(req, res)

    return true
  }

  public async sendResetPasswordToken(email: string) {
    const { token } = await this.generateToken(email, TokenType.PASSWORD_RESET)

    await this.mailService.sendResetPasswordEmail(email, token)

    return true
  }

  public async sendVerificationToken(email: string) {
    const { token } = await this.generateToken(email, TokenType.VERIFICATION)

    await this.mailService.sendVerificationEmail(email, token)

    return true
  }

  public async verifyToken(dto: VerificationTokenDto, tokenType: TokenType) {
    const token = await this.prismaService.token.findFirst({
      where: { token: dto.token, type: tokenType },
    })

    if (!token) {
      throw new NotFoundException('Токен не найден')
    }

    if (new Date(token.expiresIn) < new Date()) {
      throw new BadRequestException('Токен истек')
    }

    return token
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

  private async generateToken(email: string, type: TokenType) {
    const token = uuidV4()
    const expiresIn = new Date(Date.now() + 60 * 60 * 1000)

    await this.prismaService.token.deleteMany({
      where: {
        email,
        type,
      },
    })

    return this.prismaService.token.create({
      data: {
        email,
        token,
        type,
        expiresIn,
      },
    })
  }
}
