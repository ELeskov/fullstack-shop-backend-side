import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'

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
}
