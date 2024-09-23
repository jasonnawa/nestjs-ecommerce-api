import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument, CartItem } from './cart.schema';
import { User, UserDocument } from 'src/user/user.schema';
import { NotificationService } from 'src/notification/notification.service';
import { ObjectId } from 'mongodb';



@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly notificationService: NotificationService,
  ) {}

  async addProduct(userId: string, productId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      const newCart = new this.cartModel({
        userId,
        items: [{ productId, quantity: 1 }],
      });
      await newCart.save();

      const existingItem = newCart.items.find(
        (item) => item.productId === productId,
      );
      if (existingItem) {
        existingItem.quantity += 1; // Increase quantity
      } else {
        newCart.items.push({ productId, quantity: 1 }); // Add new item
      }
      return newCart.save();
    }

    const existingItem = cart.items.find(
      (item) => item.productId === productId,
    );
    if (existingItem) {
      existingItem.quantity += 1; // Increase quantity
    } else {
      cart.items.push({ productId, quantity: 1 }); // Add new item
    }
    return cart.save();
  }

  async removeProduct(userId: string, productId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ userId });
    if (cart) {
      const existingItem = cart.items.find(
        (item) => item.productId === productId,
      );
      if (existingItem) {
        if (existingItem.quantity === 1) {
          cart.items = cart.items.filter(
            (item) => item.productId !== productId,
          );
          return cart.save();
        } else if (existingItem.quantity > 1) {
          existingItem.quantity -= 1;
          return cart.save();
        } else {
          return cart.save();
        }
        // decrease quantity
      }
      return cart.save();
    }
    return null; // Cart not found
  }

  async getAllProducts(userId: string): Promise<Cart> {
    return await this.cartModel.findOne({ userId }).select('items').exec();
  }

  async checkout(userId: string): Promise<unknown> {
    //
    const x: ObjectId = new ObjectId(userId);
    const user = await this.userModel.findById(x);
    const phoneNumber = user.phoneNumber;
    /*
    const cart = await this.cartModel.findOne({ userId });
    if (cart) {
      await this.cartModel.deleteOne();

      const message = `Your order is ${cart.items}!`;
      await this.notificationService.sendNotification(phoneNumber, message);
      return 'cart deleted succeessfully';
    }
      */
    return ` ${userId} ${phoneNumber} cart deleted successfully`;
  }
}
