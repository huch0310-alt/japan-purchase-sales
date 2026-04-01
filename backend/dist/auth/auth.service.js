"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const staff_service_1 = require("../users/staff.service");
const customer_service_1 = require("../users/customer.service");
const loginFailures = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const FAILURE_WINDOW_MS = 30 * 60 * 1000;
const LOGIN_FAILURE_TTL_MS = 24 * 60 * 60 * 1000;
const LOGIN_FAILURE_MAX_KEYS = 10000;
let AuthService = class AuthService {
    constructor(staffService, customerService, jwtService) {
        this.staffService = staffService;
        this.customerService = customerService;
        this.jwtService = jwtService;
    }
    cleanupLoginFailures(now) {
        for (const [key, record] of loginFailures.entries()) {
            const lastRelevantAt = record.lockedUntil ? Math.max(record.firstFailureAt, record.lockedUntil) : record.firstFailureAt;
            if (now - lastRelevantAt > LOGIN_FAILURE_TTL_MS) {
                loginFailures.delete(key);
            }
        }
    }
    ensureLoginFailuresCapacity(now) {
        if (loginFailures.size < LOGIN_FAILURE_MAX_KEYS)
            return;
        this.cleanupLoginFailures(now);
        if (loginFailures.size < LOGIN_FAILURE_MAX_KEYS)
            return;
        const entries = Array.from(loginFailures.entries());
        entries.sort((a, b) => a[1].firstFailureAt - b[1].firstFailureAt);
        const removeCount = Math.max(1, Math.floor(LOGIN_FAILURE_MAX_KEYS * 0.1));
        for (let i = 0; i < Math.min(removeCount, entries.length); i++) {
            loginFailures.delete(entries[i][0]);
        }
    }
    checkAccountLockout(username, userType) {
        const key = `${userType}:${username}`;
        const record = loginFailures.get(key);
        if (record && record.lockedUntil) {
            if (Date.now() < record.lockedUntil) {
                const remainingMinutes = Math.ceil((record.lockedUntil - Date.now()) / 60000);
                throw new common_1.BadRequestException(`账户已被锁定，请在 ${remainingMinutes} 分钟后重试`);
            }
            loginFailures.delete(key);
        }
    }
    recordLoginFailure(username, userType) {
        const key = `${userType}:${username}`;
        const now = Date.now();
        this.ensureLoginFailuresCapacity(now);
        let record = loginFailures.get(key);
        if (!record || (now - record.firstFailureAt) > FAILURE_WINDOW_MS) {
            record = {
                count: 1,
                firstFailureAt: now,
                lockedUntil: null,
            };
        }
        else {
            record.count++;
        }
        if (record.count >= MAX_LOGIN_ATTEMPTS) {
            record.lockedUntil = now + LOCKOUT_DURATION_MS;
        }
        loginFailures.set(key, record);
    }
    clearLoginFailure(username, userType) {
        const key = `${userType}:${username}`;
        loginFailures.delete(key);
    }
    async validateStaff(username, password) {
        this.checkAccountLockout(username, 'staff');
        const staff = await this.staffService.findByUsername(username);
        if (staff && await bcrypt.compare(password, staff.passwordHash)) {
            this.clearLoginFailure(username, 'staff');
            const { passwordHash, ...result } = staff;
            return result;
        }
        this.recordLoginFailure(username, 'staff');
        return null;
    }
    async validateCustomer(username, password) {
        this.checkAccountLockout(username, 'customer');
        const customer = await this.customerService.findByUsername(username);
        if (customer && await bcrypt.compare(password, customer.passwordHash)) {
            this.clearLoginFailure(username, 'customer');
            const { passwordHash, ...result } = customer;
            return result;
        }
        this.recordLoginFailure(username, 'customer');
        return null;
    }
    async loginStaff(staff) {
        const payload = {
            username: staff.username,
            sub: staff.id,
            role: staff.role,
            type: 'staff'
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: staff.id,
                username: staff.username,
                name: staff.name,
                role: staff.role,
                type: 'staff'
            }
        };
    }
    async loginCustomer(customer) {
        const payload = {
            username: customer.username,
            sub: customer.id,
            role: 'customer',
            type: 'customer'
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: customer.id,
                username: customer.username,
                companyName: customer.companyName,
                role: 'customer',
                type: 'customer'
            }
        };
    }
    async validateToken(payload) {
        if (payload.type === 'staff') {
            const staff = await this.staffService.findById(payload.sub);
            if (staff && staff.isActive) {
                return { ...staff, type: 'staff' };
            }
        }
        else if (payload.type === 'customer') {
            const customer = await this.customerService.findById(payload.sub);
            if (customer && customer.isActive) {
                return { ...customer, type: 'customer' };
            }
        }
        throw new common_1.UnauthorizedException('无效的令牌');
    }
    async changePassword(userId, userType, oldPassword, newPassword) {
        let user;
        if (userType === 'staff') {
            user = await this.staffService.findById(userId);
        }
        else {
            user = await this.customerService.findById(userId);
        }
        if (!user) {
            throw new common_1.UnauthorizedException('用户不存在');
        }
        const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('原密码错误');
        }
        if (userType === 'staff') {
            await this.staffService.updatePassword(userId, newPassword);
        }
        else {
            await this.customerService.updatePassword(userId, newPassword);
        }
        return { message: '密码修改成功' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [staff_service_1.StaffService,
        customer_service_1.CustomerService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map