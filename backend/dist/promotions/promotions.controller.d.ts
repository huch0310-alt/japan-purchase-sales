import { PromotionsService } from './promotions.service';
export declare class PromotionsController {
    private readonly promotionsService;
    constructor(promotionsService: PromotionsService);
    createPromotion(body: any): Promise<import("./entities/promotion.entity").Promotion>;
    getActivePromotions(): Promise<import("./entities/promotion.entity").Promotion[]>;
    createCoupon(body: any): Promise<import("./entities/coupon.entity").Coupon>;
    getCoupons(isActive?: string): Promise<import("./entities/coupon.entity").Coupon[]>;
    validateCoupon(body: {
        code: string;
        orderAmount: number;
    }): Promise<{
        valid: boolean;
        message: string;
        coupon?: undefined;
    } | {
        valid: boolean;
        coupon: import("./entities/coupon.entity").Coupon;
        message?: undefined;
    }>;
}
