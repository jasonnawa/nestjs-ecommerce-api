import { Controller, Get,  Param } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from './order.schema';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // GET /orders - Get all orders
  @Get(':userId')
  async getAllOrders(@Param('userId') userId: string): Promise<Order[]> {
    return this.orderService.getAllOrders(userId);
  }
}
