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

import { LoginDto } from '@/api/auth/account/dto/login.dto'
import { RegisterDto } from '@/api/auth/account/dto/register.dto'
import { ResetPasswordDto } from '@/api/auth/account/dto/reset-password.dto'
import { VerificationTokenDto } from '@/api/auth/account/dto/verificationToken.dto'
import { S3Service } from '@/api/s3/s3.service'
import { UsersService } from '@/api/users/users.service'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { MailService } from '@/libs/mail/mail.service'
import { S3_NAME_FOLDERS } from '@/shared/consts'
import { extractKeyFromUrl } from '@/shared/utils/extractionKeyFromUrl'
import { PatchUserDto } from '@/api/auth/account/dto/patchUser.dto'

@Injectable()
export class AccountService {
  public constructor(
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
  ) {}

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

        basket: {
          create: {},
        },
        favorites: {
          create: {},
        },
      },
    })

    return this.saveSession(req, user)
  }

  public async login(req: Request, dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email)
    if (!user || !user.password) {
      throw new NotFoundException('Пользователь не найден')
    }

    const isValidPassword = await verify(user.password, dto.password)

    if (!isValidPassword) {
      throw new NotFoundException('Пользователь не найден')
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

  public async getProfile(userId: string) {
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

  public async updateProfile(userId: string, dto: PatchUserDto) {
    return this.prismaService.user.update({
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
  }

  public async updateAvatar(user: User, file: Express.Multer.File) {
    const { path } = await this.s3Service.upload(
      S3_NAME_FOLDERS.S3_USER_AVATAR,
      file,
    )

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        picture: path,
      },
    })

    if (user.picture) {
      const key = extractKeyFromUrl(user.picture)
      await this.s3Service.delete(key)
    }

    return { url: path }
  }

  public async confirmEmail(dto: VerificationTokenDto) {
    const tokenRecord = await this.verifyToken(dto, TokenType.VERIFICATION)

    await this.prismaService.$transaction(async tx => {
      await tx.user.update({
        where: { email: tokenRecord.email },
        data: { isVerified: true },
      })

      await tx.token.deleteMany({
        where: { email: tokenRecord.email, type: TokenType.VERIFICATION },
      })
    })

    return true
  }

  public async resetPassword(
    dto: ResetPasswordDto,
    req: Request,
    res: Response,
  ) {
    if (dto.password !== dto.confirmPassword) {
      throw new ConflictException('Пароли не совпадают')
    }

    const tokenRecord = await this.verifyToken(dto, TokenType.PASSWORD_RESET)
    const hashedPassword = await hash(dto.password)

    await this.prismaService.$transaction(async tx => {
      await tx.user.update({
        where: { email: tokenRecord.email },
        data: { password: hashedPassword },
      })

      await tx.token.deleteMany({
        where: { email: tokenRecord.email, type: TokenType.PASSWORD_RESET },
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
    const tokenRecord = await this.prismaService.token.findFirst({
      where: { token: dto.token, type: tokenType },
    })

    if (!tokenRecord) {
      throw new NotFoundException('Токен не найден или недействителен')
    }

    if (new Date(tokenRecord.expiresIn) < new Date()) {
      throw new BadRequestException('Срок действия токена истек')
    }

    return tokenRecord
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

    return this.prismaService.$transaction(async tx => {
      await tx.token.deleteMany({
        where: { email, type },
      })

      return tx.token.create({
        data: { email, token, type, expiresIn },
      })
    })
  }

  public async delete(userId: string) {
    if (!userId) {
      throw new BadRequestException('ID пользователя обязателен')
    }

    await this.prismaService.user.delete({
      where: { id: userId },
    })

    return true
  }
}
