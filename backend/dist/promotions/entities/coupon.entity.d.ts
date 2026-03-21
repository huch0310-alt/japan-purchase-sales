export declare enum CouponType {
    DISCOUNT = "discount",
    REDUCE = "reduce"
}
export declare class Coupon {
    id: string;
    code: string;
    type: CouponType;
    value: number;
    minAmount: number;
    validFrom: Date;
    validTo: Date;
    usageLimit: number;
    usedCount: number;
    isActive: boolean;
    createdAt: Date;
}
