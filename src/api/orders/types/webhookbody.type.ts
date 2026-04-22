export type YookassaWebhookDto = {
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
