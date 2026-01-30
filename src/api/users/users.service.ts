import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { User } from '@prisma/generated/client'
import { hash } from 'argon2'
import { Request } from 'express'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { extractKeyFromUrl } from '@/shared/utils/extractionKeyFromUrl'

import { S3Service } from '../s3/s3.service'

import { UpdateUserDataDto } from './dto/updateUserData.dto'
import { ICreateUser } from './types/create-user.interface'

@Injectable()
export class UsersService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  public async getMe(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
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

    if (!user) {
      throw new NotFoundException('Пользователь не найден')
    }

    return user
  }

  public async findById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      omit: {
        password: true,
      },
      include: {
        accounts: true,
        orders: true,
        shops: true,
        favorites: true,
      },
    })

    if (!user) {
      throw new NotFoundException('Пользователь не найден')
    }

    return user
  }

  public async findByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
      include: {
        accounts: true,
      },
    })

    return user
  }

  public async create(userCreateType: ICreateUser) {
    const { name, email, password, method, picture } = userCreateType

    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        password: password ? await hash(password) : '',
        picture,
        method,
      },
      include: {
        accounts: true,
      },
    })

    return user
  }

  public async updateUserData(req: Request, dto: UpdateUserDataDto) {
    const userId = req.session.userId

    const existingUser = await this.prismaService.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      throw new NotFoundException('Пользователь не найден')
    }

    if (dto.newEmail && dto.newEmail !== existingUser.email) {
      const emailExists = await this.prismaService.user.findUnique({
        where: { email: dto.newEmail },
      })

      if (emailExists) {
        throw new ConflictException('Пользователь с таким email уже существует')
      }
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        email: dto.newEmail,
        name: dto.firstName,
      },
      include: {
        accounts: true,
        orders: true,
        shops: true,
        favorites: true,
      },
      omit: { password: true },
    })

    return updatedUser
  }

  public async changeAvatar(user: User, file: Express.Multer.File) {
    const newAvatartUrl = await this.s3Service.upload(file)

    if (user.picture) {
      const key = extractKeyFromUrl(user.picture)
      await this.s3Service.delete(key)
    }

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        picture: newAvatartUrl,
      },
    })

    return { url: newAvatartUrl }
  }
}
