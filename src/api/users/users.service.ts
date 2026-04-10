import { Injectable, NotFoundException } from '@nestjs/common'
import { UserRole } from '@prisma/generated/enums'

import { S3Service } from '@/api/s3/s3.service'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { extractKeyFromUrl } from '@/shared/utils/extractionKeyFromUrl'

import { AdminUpdateUserDto } from './dto/admin-update-user.dto'

@Injectable()
export class UsersService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  public async findAll() {
    return this.prismaService.user.findMany({
      orderBy: { createdAt: 'desc' },
      omit: { password: true },
      include: { accounts: true },
    })
  }

  public async findById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      omit: { password: true },
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
    return this.prismaService.user.findUnique({
      where: { email },
      include: { accounts: true },
    })
  }

  public async updateRole(id: string, role: UserRole) {
    return this.prismaService.user.update({
      where: { id },
      data: { role },
      omit: { password: true },
    })
  }

  public async updateProfileByAdmin(id: string, dto: AdminUpdateUserDto) {
    if (dto.picture === '') {
      const user = await this.prismaService.user.findUnique({
        where: { id },
        select: { picture: true },
      })

      if (user?.picture) {
        const key = extractKeyFromUrl(user.picture)
        await this.s3Service.delete(key).catch(() => null)
      }
    }

    return this.prismaService.user.update({
      where: { id },
      data: dto,
      omit: { password: true },
    })
  }

  public async deleteUser(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: { picture: true, shops: { select: { picture: true } } },
    })

    if (!user) {
      throw new NotFoundException('Пользователь не найден')
    }

    await this.prismaService.user.delete({
      where: { id },
    })

    const keysToDelete: string[] = []

    if (user.picture) {
      keysToDelete.push(extractKeyFromUrl(user.picture))
    }

    user.shops.forEach(shop => {
      if (shop.picture) keysToDelete.push(extractKeyFromUrl(shop.picture))
    })

    keysToDelete.forEach(key => {
      this.s3Service.delete(key).catch(() => null)
    })

    return true
  }
}
