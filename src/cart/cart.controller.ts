import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add/:userId/:productId')
  async addProduct(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.addProduct(userId, productId);
  }

  @Delete('remove/:userId/:productId')
  async removeProduct(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeProduct(userId, productId);
  }

  @Get(':userId')
  async getAllProducts(@Param('userId') userId: string) {
    return this.cartService.getAllProducts(userId);
  }

  @Post('/checkout/:userId')
  async checkout(
    @Param('userId') userId: string,
    //@Body() body: { total: number},
  ) {
    return this.cartService.checkout(userId);
  }
}
