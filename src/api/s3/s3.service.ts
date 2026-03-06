import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { Injectable, Logger } from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { S3FolderValue } from '@/shared/consts'
import { extractKeyFromUrl } from '@/shared/utils/extractionKeyFromUrl'

@Injectable()
export class S3Service {
  private readonly client: S3Client
  private readonly bucket: string
  private readonly logger = new Logger(S3Service.name)

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

  public async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })

    await this.client.send(command)
  }

  public async deleteByUrl(fileUrl: string): Promise<void> {
    try {
      const key = extractKeyFromUrl(fileUrl)
      await this.delete(key)
    } catch (error) {
      this.logger.error(
        `Не удалось извлечь ключ или удалить файл: ${fileUrl}`,
        error,
      )
    }
  }

  public async deleteManyByUrls(fileUrls: string[]): Promise<void> {
    if (!fileUrls || fileUrls.length === 0) return

    await Promise.all(fileUrls.map(url => this.deleteByUrl(url)))
  }
}
