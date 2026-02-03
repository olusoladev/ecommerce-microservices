import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './order.service';
import { IResponse } from 'src/interfaces/response.interface';
import { OrderCreatedEvent } from './interface/index.interface';
import { MessagePattern } from '@nestjs/microservices';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<IResponse<OrderCreatedEvent>> {
    const order = await this.ordersService.createOrder(createOrderDto);
    return {
      data: order,
      status: HttpStatus.CREATED,
      message: 'Order created successfully',
    };
  }

  @MessagePattern({ cmd: 'get_order_by_id' })
  async getOrderById(orderId: string) {
    return this.ordersService.findByOrderId(orderId);
  }

}
