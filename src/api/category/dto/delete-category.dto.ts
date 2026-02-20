import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class DeleteCategoryDto {
  @ApiProperty({
    example: '12hv12d121c1-d1351jhk1bh2i1d-dfiygdf6y8dgaf8',
    description: 'Id категории',
  })
  @IsString()
  categoryId!: string
}
