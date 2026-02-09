import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { S3FolderValue } from '@/shared/consts'

@Injectable()
export class S3Service {
  private readonly client: S3Client
  private readonly bucket: string

  public constructor(private readonly prismaService: PrismaService) {
    this.client = new S3Client({
      endpoint: process.env['S3_ENDPOINT']!,
      credentials: {
        accessKeyId: process.env['S3_ACCESS_KEY_ID']!,
        secretAccessKey: process.env['S3_SECRET_ACCESS_KEY']!,
      },
      region: process.env['S3_REGION']!,
    })

    this.bucket = process.env['S3_BUCKET_NAME']!
  }

  public async upload(
    s3Folder: S3FolderValue,
    file: Express.Multer.File,
  ): Promise<{ path: string }> {
    const key = `${s3Folder}/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.originalname}`

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })

    await this.client.send(command)

    return { path: `https://${this.bucket}.s3.timeweb.cloud/${key}` }
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })

    await this.client.send(command)
  }
}
