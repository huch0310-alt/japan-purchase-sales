import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { CustomerService } from '../users/customer.service';
import { SettingService } from '../settings/settings.service';

/**
 * 购物车服务
 */
@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    private customerService: CustomerService,
    private settingService: SettingService,
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
   * 验证购物车是否属于当前用户
   */
  async updateQuantity(id: string, customerId: string, quantity: number): Promise<CartItem | void> {
    const item = await this.cartItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('购物车商品不存在');
    }
    if (item.customerId !== customerId) {
      throw new ForbiddenException('无权操作此购物车商品');
    }
    if (quantity <= 0) {
      return this.deleteItem(id, customerId);
    }
    await this.cartItemRepository.update(id, { quantity });
    const updatedItem = await this.cartItemRepository.findOne({ where: { id }, relations: ['product'] });
    return updatedItem ?? undefined;
  }

  /**
   * 删除购物车商品
   * 验证购物车是否属于当前用户
   */
  async deleteItem(id: string, customerId: string): Promise<void> {
    const item = await this.cartItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('购物车商品不存在');
    }
    if (item.customerId !== customerId) {
      throw new ForbiddenException('无权操作此购物车商品');
    }
    await this.cartItemRepository.delete(id);
  }

  /**
   * 清空客户购物车
   */
  async clear(customerId: string): Promise<void> {
    await this.cartItemRepository.delete({ customerId });
  }

  /**
   * 计算购物车金额（应用VIP折扣和动态税率）
   */
  async calculateTotal(customerId: string): Promise<{ subtotal: number; taxAmount: number; total: number; discountAmount: number }> {
    const items = await this.findByCustomer(customerId);
    let subtotal = 0;
    for (const item of items) {
      if (item.product) {
        subtotal += Number(item.product.salePrice) * item.quantity;
      }
    }

    // 获取客户VIP折扣率
    const customer = await this.customerService.findById(customerId);
    const vipDiscount = customer?.vipDiscount || 0;
    const vipDiscountNum = parseFloat(String(vipDiscount)) / 100; // 10 -> 0.10

    // 应用VIP折扣后的金额
    const afterDiscount = Math.round(subtotal * (1 - vipDiscountNum) * 100) / 100;
    const discountAmount = Math.round((subtotal - afterDiscount) * 100) / 100;

    // 获取税率设置
    const taxRateStr = await this.settingService.get('tax_rate');
    const taxRateNum = parseFloat(taxRateStr || '10') / 100; // 默认10%

    // 计算消费税（折扣后金额 * 税率）
    const taxAmount = Math.round(afterDiscount * taxRateNum);
    const total = Math.round((afterDiscount + taxAmount) * 100) / 100;

    return { subtotal, taxAmount, total, discountAmount };
  }
}
