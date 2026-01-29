import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { User } from '@prisma/generated/client'
import { TokenType } from '@prisma/generated/enums'
import { Request } from 'express'
import { v4 as uuidv4 } from 'uuid'

import { UsersService } from '@/api/users/users.service'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { MailService } from '@/libs/mail/mail.service'

import { AuthService } from '../auth.service'

import { AccountDto } from './dto/account.dto'

@Injectable()
export class AccountService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
    private readonly userService: UsersService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  public async newVerification(req: Request, dto: AccountDto) {
    const existingToken = await this.prismaService.token.findFirst({
      where: {
        token: dto.token,
        type: TokenType.VERIFICATION,
      },
    })

    if (!existingToken) {
      throw new NotFoundException(
        'Токен подтверждения не найден. Пожалуйста, убедитесь, что у вас правильный токен',
      )
    }

    const hasExpired = new Date(existingToken.expiresIn) < new Date()

    if (hasExpired) {
      throw new BadRequestException(
        'Токен подтверждения истек. Пожалуйста, запросите новый токен для подтверждения',
      )
    }

    const existingUser = await this.userService.findByEmail(existingToken.email)

    if (!existingUser) {
      throw new NotFoundException(
        'Пользователь с указанной почтой не найден. Убедитесь, что вы ввели правильный email',
      )
    }

    await this.prismaService.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        isVerified: true,
      },
    })
    
    console.log('🔍 ТОКЕН ПЕРЕД УДАЛЕНИЕМ:', {
      id: existingToken.id,
      token: existingToken.token,
      email: existingToken.email,
    })

    await this.prismaService.token.delete({
      where: { id: existingToken.id },
    })

    console.log('✅ Токен удалён!')

    return await this.authService.saveSession(req, existingUser)
  }

  public async sendVerificationToken(user: User) {
    const verificationToken = await this.generateVerificationToken(user.email)

    await this.mailService.sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
    )

    return true
  }

  private async generateVerificationToken(email: string) {
    const token = uuidv4()

    const expiresIn = new Date()
    expiresIn.setHours(expiresIn.getHours() + 1)

    const existingToken = await this.prismaService.token.findFirst({
      where: {
        email,
        type: TokenType.VERIFICATION,
      },
    })

    if (existingToken) {
      await this.prismaService.token.delete({
        where: {
          id: existingToken.id,
          type: TokenType.VERIFICATION,
        },
      })
    }

    const verificationToken = await this.prismaService.token.create({
      data: {
        email,
        token,
        expiresIn,
        type: TokenType.VERIFICATION,
      },
    })

    return verificationToken
  }
}
