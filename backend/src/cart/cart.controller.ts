import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * 购物车控制器
 */
@ApiTags('购物车')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: '获取购物车列表' })
  async findAll(@Request() req) {
    return this.cartService.findByCustomer(req.user.id);
  }

  @Post('items')
  @ApiOperation({ summary: '添加商品到购物车' })
  async addItem(@Request() req, @Body() body: { productId: string; quantity?: number }) {
    return this.cartService.addItem(req.user.id, body.productId, body.quantity || 1);
  }

  @Put('items/:id')
  @ApiOperation({ summary: '更新购物车商品数量' })
  async updateQuantity(@Param('id') id: string, @Body() body: { quantity: number }) {
    return this.cartService.updateQuantity(id, body.quantity);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: '删除购物车商品' })
  async deleteItem(@Param('id') id: string) {
    await this.cartService.deleteItem(id);
    return { message: '删除成功' };
  }

  @Delete()
  @ApiOperation({ summary: '清空购物车' })
  async clear(@Request() req) {
    await this.cartService.clear(req.user.id);
    return { message: '清空成功' };
  }

  @Get('total')
  @ApiOperation({ summary: '计算购物车金额' })
  async calculateTotal(@Request() req) {
    return this.cartService.calculateTotal(req.user.id);
  }
}
