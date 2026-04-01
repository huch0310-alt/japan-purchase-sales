import { Category } from '../../categories/entities/category.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';
export declare class Product {
    id: string;
    categoryName: string | null;
    updateCategoryName(): void;
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
    createdBy: string;
    salesCount: number;
    orderItems: OrderItem[];
    cartItems: CartItem[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
