import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './cart.schema';
import { Product, ProductDocument } from 'src/product/product.schema';
import { User, UserDocument } from 'src/user/user.schema';
import { NotificationService } from 'src/notification/notification.service';
import { Order, OrderDocument } from 'src/order/order.schema';
import { ObjectId } from 'mongodb';

function getTotal(productData, cart): number {
  let orderTotal = 0;
  cart.items.forEach((item) => {
    console.log('items product', item.productId);
    // Find the matching product in productData by comparing productId
    const matchingProduct = productData.find(
      (product) => product._id.toString() === item.productId._id.toString(),
    );
    if (matchingProduct) {
      // Multiply the price by quantity and add to the total
      const itemTotal = matchingProduct.price * item.quantity;
      orderTotal += itemTotal;
      console.log(
        `Product: ${matchingProduct.name}, Quantity: ${item.quantity}, Price: ${matchingProduct.price}, Total for this item: ${itemTotal}`,
      );
    }
  });
  return orderTotal;
}

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly notificationService: NotificationService,
  ) {}

  async addProduct(userId: string, productId: string): Promise<Cart> {
    //get cart for user
    const newUserId: ObjectId = new ObjectId(userId);
    const cart = await this.cartModel
      .findOne({ userId: newUserId })
      .populate('items.productId');
    //get productId for product
    const newProductId: ObjectId = new ObjectId(productId);
    try {
      if (!cart) {
        //if theres no available cart
        console.log('step 1');
        const newCart = new this.cartModel({
          userId: newUserId,
          items: [{ productId: newProductId, quantity: 1 }],
        }).populate('items.productId');

        if (newCart) {
          //get price and quantity for each item in cart
          const productData: any = (await newCart).items.map(
            (item) => item.productId,
          );
          console.log('product data', productData);
          const total: any = getTotal(productData, await newCart);
          console.log('Total:', total);

          // Update the total and save the cart
          (await newCart).total = total;
          return (await newCart).save();
        }
      } else {
        // if a cart is present
        const existingItem = cart.items.find(
          (item) => item.productId._id.toString() === newProductId.toString(),
        );
        if (existingItem) {
          existingItem.quantity += 1; // Increase quantity
        } else {
          cart.items.push({ productId: newProductId, quantity: 1 }); // Add new item
        }
        const savedCart = await cart.save(); // Save the cart

        // Query the cart again with populate
        const populatedCart = await this.cartModel
          .findById(savedCart._id)
          .populate('items.productId');
        //get price and quantity for each item in cart
        const productData: any = populatedCart.items.map(
          (item) => item.productId,
        );
        const total: any = getTotal(productData, populatedCart);
        // Update the total and save the cart
        cart.total = total;
        return await cart.save();
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
      throw error;
    }
  }

  async removeProduct(userId: string, productId: string): Promise<Cart> {
    // Get cart for user
    const newUserId: ObjectId = new ObjectId(userId);
    const cart = await this.cartModel
      .findOne({ userId: newUserId })
      .populate('items.productId');

    const newProductId: ObjectId = new ObjectId(productId);

    try {
      if (!cart) {
        // If no cart exists
        throw new Error('Cart not found for this user');
      } else {
        // Find the product in the cart
        const existingItemIndex = cart.items.findIndex(
          (item) => item.productId._id.toString() === newProductId.toString(),
        );

        if (existingItemIndex === -1) {
          // If the product is not in the cart
          throw new Error('Product not found in cart');
        }

        const existingItem = cart.items[existingItemIndex];

        if (existingItem.quantity > 1) {
          existingItem.quantity -= 1; // Decrease quantity by 1
        } else {
          cart.items.splice(existingItemIndex, 1); // Remove the product if quantity is 1
        }

        const savedCart = await cart.save(); // Save the updated cart

        // Query the updated cart with populated products
        const populatedCart = await this.cartModel
          .findById(savedCart._id)
          .populate('items.productId');

        // Recalculate total after removing the product
        const productData = populatedCart.items.map((item) => item.productId);
        const total = getTotal(productData, populatedCart);

        // Update the total and save again
        populatedCart.total = total;
        return populatedCart.save();
      }
    } catch (error) {
      console.error('Error removing product from cart:', error);
      throw error;
    }
  }

  async getAllProducts(userId: string): Promise<Cart> {
    const x: ObjectId = new ObjectId(userId);

    try {
      const cart = await this.cartModel
        .findOne({ userId: x })
        .select('items total')
        .populate('items.productId')
        .exec();

      return cart;
    } catch (error) {
      return error;
    }
  }

  async checkout(userId: string): Promise<unknown> {
    try {
      //get user
      const x: ObjectId = new ObjectId(userId);
      const user = await this.userModel.findById(x);
      const phoneNumber = user.phoneNumber;
      // Get the cart for the user
      const cart = await this.cartModel
        .findOne({ userId: new ObjectId(userId) })
        .populate('items.productId');
      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      // Create a new order
      const newOrder = new this.orderModel({
        userId: cart.userId,
        items: cart.items.map((item) => ({
          productId: item.productId._id,
          quantity: item.quantity,
        })),
        total: cart.total,
        orderDate: new Date(),
      });

      // Save the order
      const order = await newOrder.save();
      const items: any = cart.items;

      const data = items.map((item) => {
        return `${item.productId.name} x${item.quantity} `;
      });
      const message = `order confirmed : ${data}!\n total - $${cart.total}`;
      await this.notificationService.sendNotification(phoneNumber, message);

      // Clear the user's cart after placing the order
      cart.items = [];
      cart.total = 0;
      await cart.save();

      return order;
    } catch (error) {
      return error;
    }
  }
}
