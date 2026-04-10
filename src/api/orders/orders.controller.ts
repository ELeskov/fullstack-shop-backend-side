import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger'

import { GetOrdersQueryDto } from '@/api/orders/dto/get-orders-query.dto'
import { OrderResponseDto } from '@/api/orders/dto/order-response.dto'
import { PayOrderResponseDto } from '@/api/orders/dto/pay-order-response.dto'
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator'
import { Authorization } from '@/shared/decorators/auth.decorator'
import { Authorized } from '@/shared/decorators/authorized.decorator'

import { OrdersService } from './orders.service'

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Authorization()
  @ApiCookieAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Создание заказа из выбранных товаров корзины',
    description:
      'Создаёт заказ текущего пользователя на основе выбранных товаров в корзине. Рассчитывает итоговую сумму заказа, переносит товары из корзины в order_items и удаляет оформленные позиции из корзины.',
  })
  @ApiCreatedResponse({
    description: 'Заказ успешно создан',
    schema: {
      type: 'boolean',
      example: true,
    },
  })
  @ApiCommonErrors()
  public async create(@Authorized('id') userId: string) {
    return this.ordersService.create(userId)
  }

  @Get()
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Получить мои заказы',
    description:
      'Возвращает список заказов текущего пользователя. Поддерживает фильтрацию по статусу и сортировку по дате создания.',
  })
  @ApiOkResponse({
    description: 'Список заказов успешно получен',
    type: OrderResponseDto,
    isArray: true,
  })
  @ApiCommonErrors()
  public async getMyOrders(
    @Authorized('id') userId: string,
    @Query() query: GetOrdersQueryDto,
  ) {
    return this.ordersService.getByUserId(userId, query)
  }

  @Get(':id')
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Получить заказ по ID',
    description:
      'Возвращает один заказ текущего пользователя по его идентификатору. Если заказ не существует или принадлежит другому пользователю, будет возвращена ошибка 404.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID заказа',
    example: 'e6de9db5-29bc-4708-8cc5-c6d7d7d31111',
  })
  @ApiOkResponse({
    description: 'Заказ успешно получен',
    type: OrderResponseDto,
  })
  @ApiCommonErrors()
  public async getById(
    @Authorized('id') userId: string,
    @Param('id') orderId: string,
  ) {
    return this.ordersService.getById(userId, orderId)
  }

  @Post(':id/pay')
  @Authorization()
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Создать оплату заказа через YooKassa',
    description:
      'Создаёт платёж в YooKassa для заказа текущего пользователя и возвращает ссылку, на которую нужно перенаправить пользователя для оплаты.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID заказа',
    example: 'e6de9db5-29bc-4708-8cc5-c6d7d7d31111',
  })
  @ApiOkResponse({
    description: 'Платёж успешно создан',
    type: PayOrderResponseDto,
  })
  @ApiCommonErrors()
  public async payOrder(
    @Authorized('id') userId: string,
    @Param('id') orderId: string,
  ) {
    return this.ordersService.payOrder(userId, orderId)
  }
}
