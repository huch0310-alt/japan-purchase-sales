"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewaysModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const realtime_gateway_1 = require("./realtime.gateway");
const jwt_strategy_1 = require("../auth/strategies/jwt.strategy");
const auth_module_1 = require("../auth/auth.module");
let GatewaysModule = class GatewaysModule {
};
exports.GatewaysModule = GatewaysModule;
exports.GatewaysModule = GatewaysModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this',
                signOptions: { expiresIn: '7d' },
            }),
            auth_module_1.AuthModule,
        ],
        providers: [realtime_gateway_1.RealtimeGateway, jwt_strategy_1.JwtStrategy],
        exports: [realtime_gateway_1.RealtimeGateway, jwt_1.JwtModule],
    })
], GatewaysModule);
//# sourceMappingURL=gateways.module.js.map