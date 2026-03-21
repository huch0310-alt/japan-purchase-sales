export declare enum PointsType {
    ORDEREarn = "order_earn",
    ORDERUse = "order_use",
    REGISTER = "register",
    REFERRAL = "referral",
    EXPIRE = "expire"
}
export declare class PointsLog {
    id: string;
    customerId: string;
    type: PointsType;
    points: number;
    relatedId: string;
    remark: string;
    createdAt: Date;
}
