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
const customer_service_1 = require("../users/customer.service");
const settings_service_1 = require("../settings/settings.service");
let CartService = class CartService {
    constructor(cartItemRepository, customerService, settingService) {
        this.cartItemRepository = cartItemRepository;
        this.customerService = customerService;
        this.settingService = settingService;
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
    async updateQuantity(id, customerId, quantity) {
        const item = await this.cartItemRepository.findOne({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException('购物车商品不存在');
        }
        if (item.customerId !== customerId) {
            throw new common_1.ForbiddenException('无权操作此购物车商品');
        }
        if (quantity <= 0) {
            return this.deleteItem(id, customerId);
        }
        await this.cartItemRepository.update(id, { quantity });
        const updatedItem = await this.cartItemRepository.findOne({ where: { id }, relations: ['product'] });
        return updatedItem ?? undefined;
    }
    async deleteItem(id, customerId) {
        const item = await this.cartItemRepository.findOne({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException('购物车商品不存在');
        }
        if (item.customerId !== customerId) {
            throw new common_1.ForbiddenException('无权操作此购物车商品');
        }
        await this.cartItemRepository.delete(id);
    }
    async clear(customerId) {
        await this.cartItemRepository.delete({ customerId });
    }
    async calculateTotal(customerId) {
        const items = await this.findByCustomer(customerId);
        let subtotal = 0;
        for (const item of items) {
            if (item.product) {
                subtotal += Number(item.product.salePrice) * item.quantity;
            }
        }
        const customer = await this.customerService.findById(customerId);
        const vipDiscount = customer?.vipDiscount || 0;
        const vipDiscountNum = parseFloat(String(vipDiscount)) / 100;
        const afterDiscount = Math.round(subtotal * (1 - vipDiscountNum) * 100) / 100;
        const discountAmount = Math.round((subtotal - afterDiscount) * 100) / 100;
        const taxRateStr = await this.settingService.get('tax_rate');
        const taxRateNum = parseFloat(taxRateStr || '10') / 100;
        const taxAmount = Math.round(afterDiscount * taxRateNum);
        const total = Math.round((afterDiscount + taxAmount) * 100) / 100;
        return { subtotal, taxAmount, total, discountAmount };
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cart_item_entity_1.CartItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        customer_service_1.CustomerService,
        settings_service_1.SettingService])
], CartService);
//# sourceMappingURL=cart.service.js.map