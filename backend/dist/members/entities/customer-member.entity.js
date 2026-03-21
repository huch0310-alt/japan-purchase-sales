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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerMember = void 0;
const typeorm_1 = require("typeorm");
const customer_entity_1 = require("../../users/entities/customer.entity");
const member_level_entity_1 = require("./member-level.entity");
let CustomerMember = class CustomerMember {
};
exports.CustomerMember = CustomerMember;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CustomerMember.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], CustomerMember.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer),
    __metadata("design:type", customer_entity_1.Customer)
], CustomerMember.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], CustomerMember.prototype, "levelId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => member_level_entity_1.MemberLevel),
    __metadata("design:type", member_level_entity_1.MemberLevel)
], CustomerMember.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], CustomerMember.prototype, "points", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 0 }),
    __metadata("design:type", Number)
], CustomerMember.prototype, "totalPoints", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CustomerMember.prototype, "joinedAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CustomerMember.prototype, "updatedAt", void 0);
exports.CustomerMember = CustomerMember = __decorate([
    (0, typeorm_1.Entity)('customer_members')
], CustomerMember);
//# sourceMappingURL=customer-member.entity.js.map