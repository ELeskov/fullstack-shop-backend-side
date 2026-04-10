import { Body, Controller, Get, Post } from '@nestjs/common'

import { YoomoneyService } from '@/api/providers/yoomoney/yoomoney.service'

type YookassaWebhookDto = {
  type: 'notification'
  event:
    | 'payment.succeeded'
    | 'payment.waiting_for_capture'
    | 'payment.canceled'
  object: {
    id: string
    status: string
    paid?: boolean
    metadata?: {
      orderId?: string
      userId?: string
    }
    amount?: {
      value: string
      currency: string
    }
  }
}

@Controller('yoomoney')
export class YoomoneyController {
  constructor(private readonly yoomoneyService: YoomoneyService) {}

  @Post('notification')
  public async notification(@Body() body: YookassaWebhookDto) {
    return this.yoomoneyService.handleWebhook(body)
  }

  @Get()
  public getMeth() {
    return 12
  }
}

// https://nondisruptingly-peaselike-inell.ngrok-free.dev/api/yoomoney/notification
