import { Injectable, NotFoundException } from '@nestjs/common'
import { User } from '@prisma/generated/client'
import { Request } from 'express'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { extractKeyFromUrl } from '@/shared/utils/extractionKeyFromUrl'

import { PatchUserDto } from '../auth/account/dto/patchUser.dto'
import { S3Service } from '../s3/s3.service'

@Injectable()
export class UsersService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

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

  public async patchUser(req: Request, dto: PatchUserDto) {
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

  public async changeAvatar(user: User, file: Express.Multer.File) {
    const newAvatarUrl = await this.s3Service.upload(file)

    if (user.picture) {
      const key = extractKeyFromUrl(user.picture)
      await this.s3Service.delete(key)
    }

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        picture: newAvatarUrl,
      },
    })

    return { url: newAvatarUrl }
  }
}
