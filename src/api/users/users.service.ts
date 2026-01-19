import { Injectable, NotFoundException } from '@nestjs/common'
import { hash } from 'argon2'

import { PrismaService } from '@/infra/prisma/prisma.service'

import { ICreateUser } from './types/create-user.interface'

@Injectable()
export class UsersService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findById(id: string) {
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
    })

    if (!user) {
      throw new NotFoundException('Пользователь не найден')
    }

    return user
  }

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
    const { name, email, password, picture, method } = userCreateType

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
}
