"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const promotion_entity_1 = require("./entities/promotion.entity");
const coupon_entity_1 = require("./entities/coupon.entity");
let PromotionsService = class PromotionsService {
    constructor(promotionRepository, couponRepository) {
        this.promotionRepository = promotionRepository;
        this.couponRepository = couponRepository;
    }
    async createPromotion(data) {
        const promotion = this.promotionRepository.create(data);
        return this.promotionRepository.save(promotion);
    }
    async getActivePromotions() {
        const now = new Date();
        return this.promotionRepository.find({
            where: {
                isActive: true,
                startDate: (0, typeorm_2.LessThanOrEqual)(now),
                endDate: (0, typeorm_2.MoreThanOrEqual)(now),
            },
            order: { createdAt: 'DESC' },
        });
    }
    async calculatePromotionDiscount(promotionId, orderAmount) {
        const promotion = await this.promotionRepository.findOne({ where: { id: promotionId } });
        if (!promotion || !promotion.isActive)
            return 0;
        const now = new Date();
        if (now < promotion.startDate || now > promotion.endDate)
            return 0;
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
        if (promotion.maxDiscount && discount > promotion.maxDiscount) {
            discount = promotion.maxDiscount;
        }
        return Math.min(discount, orderAmount);
    }
    async createCoupon(data) {
        const coupon = this.couponRepository.create(data);
        return this.couponRepository.save(coupon);
    }
    async validateCoupon(code, orderAmount) {
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
    async useCoupon(id) {
        await this.couponRepository.increment({ id }, 'usedCount', 1);
    }
    async getCoupons(isActive) {
        const where = {};
        if (isActive !== undefined)
            where.isActive = isActive;
        return this.couponRepository.find({ where, order: { createdAt: 'DESC' } });
    }
};
exports.PromotionsService = PromotionsService;
exports.PromotionsService = PromotionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(promotion_entity_1.Promotion)),
    __param(1, (0, typeorm_1.InjectRepository)(coupon_entity_1.Coupon)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PromotionsService);
//# sourceMappingURL=promotions.service.js.map