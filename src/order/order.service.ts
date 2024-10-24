import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Order, OrderDocument } from './order.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  // Get all orders
  async getAllOrders(userId: string): Promise<Order[]> {
    const x: ObjectId = new ObjectId(userId);
    return this.orderModel
      .find({ userId: x })
      .populate('items.productId')
      .exec();
  }
}
