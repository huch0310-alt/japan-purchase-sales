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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cart_item_entity_1 = require("./entities/cart-item.entity");
let CartService = class CartService {
    constructor(cartItemRepository) {
        this.cartItemRepository = cartItemRepository;
    }
    async findByCustomer(customerId) {
        return this.cartItemRepository.find({
            where: { customerId },
            relations: ['product', 'product.category'],
        });
    }
    async addItem(customerId, productId, quantity = 1) {
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
    async updateQuantity(id, quantity) {
        if (quantity <= 0) {
            return this.deleteItem(id);
        }
        await this.cartItemRepository.update(id, { quantity });
        return this.cartItemRepository.findOne({ where: { id }, relations: ['product'] });
    }
    async deleteItem(id) {
        await this.cartItemRepository.delete(id);
    }
    async clear(customerId) {
        await this.cartItemRepository.delete({ customerId });
    }
    async calculateTotal(customerId) {
        const items = await this.findByCustomer(customerId);
        let subtotal = 0;
        for (const item of items) {
            subtotal += Number(item.product.salePrice) * item.quantity;
        }
        const taxAmount = Math.round(subtotal * 0.1);
        const total = subtotal + taxAmount;
        return { subtotal, taxAmount, total };
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cart_item_entity_1.CartItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CartService);
//# sourceMappingURL=cart.service.js.map