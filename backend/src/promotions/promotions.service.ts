import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { Coupon } from './entities/coupon.entity';

/**
 * 促销服务
 */
@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
  ) {}

  // ==================== 促销活动 ====================

  /**
   * 创建促销活动
   */
  async createPromotion(data: Partial<Promotion>) {
    const promotion = this.promotionRepository.create(data);
    return this.promotionRepository.save(promotion);
  }

  /**
   * 获取进行中的促销活动
   */
  async getActivePromotions() {
    const now = new Date();
    return this.promotionRepository.find({
      where: {
        isActive: true,
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 计算订单优惠
   */
  async calculatePromotionDiscount(promotionId: string, orderAmount: number): Promise<number> {
    const promotion = await this.promotionRepository.findOne({ where: { id: promotionId } });
    if (!promotion || !promotion.isActive) return 0;

    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) return 0;

    let discount = 0;
    switch (promotion.type) {
      case 'discount':
        discount = orderAmount * (promotion.discountValue / 100);
        break;
      case 'full_reduce':
        if (orderAmount >= (promotion.minAmount || 0)) {
          discount = promotion.discountValue;
        }
        break;
    }

    // 限制最大优惠金额
    if (promotion.maxDiscount && discount > promotion.maxDiscount) {
      discount = promotion.maxDiscount;
    }

    return Math.min(discount, orderAmount);
  }

  // ==================== 优惠券 ====================

  /**
   * 创建优惠券
   */
  async createCoupon(data: Partial<Coupon>) {
    const coupon = this.couponRepository.create(data);
    return this.couponRepository.save(coupon);
  }

  /**
   * 验证优惠券
   */
  async validateCoupon(code: string, orderAmount: number) {
    const coupon = await this.couponRepository.findOne({ where: { code } });
    if (!coupon || !coupon.isActive) {
      return { valid: false, message: '优惠券不存在或已禁用' };
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validTo) {
      return { valid: false, message: '优惠券不在有效期内' };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: '优惠券已使用完毕' };
    }

    if (coupon.minAmount && orderAmount < coupon.minAmount) {
      return { valid: false, message: `订单金额不足，最低需 ${coupon.minAmount} 元` };
    }

    return { valid: true, coupon };
  }

  /**
   * 使用优惠券
   */
  async useCoupon(id: string) {
    await this.couponRepository.increment({ id }, 'usedCount', 1);
  }

  /**
   * 获取优惠券列表
   */
  async getCoupons(isActive?: boolean) {
    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;
    return this.couponRepository.find({ where, order: { createdAt: 'DESC' } });
  }
}
