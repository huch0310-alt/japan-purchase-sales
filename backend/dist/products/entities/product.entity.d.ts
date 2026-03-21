import { Category } from '../../categories/entities/category.entity';
import { Staff } from '../../users/entities/staff.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';
export declare class Product {
    id: string;
    category: Category;
    categoryId: string;
    name: string;
    quantity: number;
    unit: string;
    purchasePrice: number;
    salePrice: number;
    photoUrl: string;
    description: string;
    status: string;
    createdByStaff: Staff;
    createdBy: string;
    salesCount: number;
    orderItems: OrderItem[];
    cartItems: CartItem[];
    createdAt: Date;
    updatedAt: Date;
}
