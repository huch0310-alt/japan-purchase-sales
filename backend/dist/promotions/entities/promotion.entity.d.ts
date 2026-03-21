export declare enum PromotionType {
    DISCOUNT = "discount",
    FULL_REDUCE = "full_reduce",
    SPECIAL_PRICE = "special_price",
    BUNDLE = "bundle"
}
export declare class Promotion {
    id: string;
    name: string;
    type: PromotionType;
    discountValue: number;
    minAmount: number;
    maxDiscount: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}
