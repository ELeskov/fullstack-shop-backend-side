import { Controller } from '@nestjs/common'

import { YoomoneyService } from '@/api/providers/yoomoney/yoomoney.service'

@Controller('yoomoney')
export class YoomoneyController {
  constructor(private readonly yoomoneyService: YoomoneyService) {}
}
