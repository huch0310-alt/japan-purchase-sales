import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { Coupon } from './entities/coupon.entity';
export declare class PromotionsService {
    private promotionRepository;
    private couponRepository;
    constructor(promotionRepository: Repository<Promotion>, couponRepository: Repository<Coupon>);
    createPromotion(data: Partial<Promotion>): Promise<Promotion>;
    getActivePromotions(): Promise<Promotion[]>;
    calculatePromotionDiscount(promotionId: string, orderAmount: number): Promise<number>;
    createCoupon(data: Partial<Coupon>): Promise<Coupon>;
    validateCoupon(code: string, orderAmount: number): Promise<{
        valid: boolean;
        message: string;
        coupon?: undefined;
    } | {
        valid: boolean;
        coupon: Coupon;
        message?: undefined;
    }>;
    useCoupon(id: string): Promise<void>;
    getCoupons(isActive?: boolean): Promise<Coupon[]>;
}
