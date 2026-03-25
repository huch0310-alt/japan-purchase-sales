import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';

/**
 * 购物车服务
 */
@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
  ) {}

  /**
   * 获取客户购物车
   */
  async findByCustomer(customerId: string): Promise<CartItem[]> {
    return this.cartItemRepository.find({
      where: { customerId },
      relations: ['product', 'product.category'],
    });
  }

  /**
   * 添加商品到购物车
   */
  async addItem(customerId: string, productId: string, quantity: number = 1): Promise<CartItem> {
    // 检查是否已存在
    const existing = await this.cartItemRepository.findOne({
      where: { customerId, productId },
    });

    if (existing) {
      existing.quantity += quantity;
      return this.cartItemRepository.save(existing);
    }

    const cartItem = this.cartItemRepository.create({
      customerId,
      productId,
      quantity,
    });
    return this.cartItemRepository.save(cartItem);
  }

  /**
   * 更新购物车商品数量
   */
  async updateQuantity(id: string, quantity: number): Promise<CartItem | void> {
    if (quantity <= 0) {
      return this.deleteItem(id);
    }
    await this.cartItemRepository.update(id, { quantity });
    return this.cartItemRepository.findOne({ where: { id }, relations: ['product'] });
  }

  /**
   * 删除购物车商品
   */
  async deleteItem(id: string): Promise<void> {
    await this.cartItemRepository.delete(id);
  }

  /**
   * 清空客户购物车
   */
  async clear(customerId: string): Promise<void> {
    await this.cartItemRepository.delete({ customerId });
  }

  /**
   * 计算购物车金额
   */
  async calculateTotal(customerId: string): Promise<{ subtotal: number; taxAmount: number; total: number }> {
    const items = await this.findByCustomer(customerId);
    let subtotal = 0;
    for (const item of items) {
      if (item.product) {
        subtotal += Number(item.product.salePrice) * item.quantity;
      }
    }
    // 消费税10%
    const taxAmount = Math.round(subtotal * 0.1);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  }
}
