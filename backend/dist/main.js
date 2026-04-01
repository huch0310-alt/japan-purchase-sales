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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const csurf_1 = __importDefault(require("csurf"));
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const performance_interceptor_1 = require("./common/interceptors/performance.interceptor");
const logger = new common_1.Logger('Bootstrap');
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.set('trust proxy', 1);
    const helmet = (await Promise.resolve().then(() => __importStar(require('helmet')))).default;
    app.use(helmet());
    const corsOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
        : [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:80',
            'http://43.153.155.76',
            'http://43.153.155.76:80'
        ];
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (corsOrigins.includes(origin) || /^http:\/\/localhost(:[0-9]+)?$/.test(origin)) {
                callback(null, true);
            }
            else {
                logger.warn(`CORS blocked origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/uploads',
    });
    app.use((0, cookie_parser_1.default)());
    const cookieSameSite = (process.env.COOKIE_SAMESITE || 'lax');
    const cookieSecure = (process.env.COOKIE_SECURE || (process.env.NODE_ENV === 'production' ? 'true' : 'false')) === 'true';
    const csrfProtection = (0, csurf_1.default)({
        cookie: {
            key: process.env.CSRF_SECRET_COOKIE_NAME || '_csrf',
            httpOnly: true,
            secure: cookieSecure,
            sameSite: cookieSameSite,
            path: '/',
        },
    });
    app.use((req, res, next) => {
        const url = req.originalUrl || req.url || '';
        const isCsrfEndpoint = url.startsWith('/api/security/csrf');
        const isAuthLoginEndpoint = url.startsWith('/api/auth/staff/login') || url.startsWith('/api/auth/customer/login');
        const hasBearer = typeof req.headers?.authorization === 'string' && req.headers.authorization.startsWith('Bearer ');
        if (isCsrfEndpoint) {
            return csrfProtection(req, res, next);
        }
        if (isAuthLoginEndpoint) {
            return next();
        }
        if (hasBearer) {
            return next();
        }
        return csrfProtection(req, res, next);
    });
    app.use('/api/security/csrf', (req, res) => {
        const csrfToken = typeof req.csrfToken === 'function' ? req.csrfToken() : null;
        res.setHeader('Cache-Control', 'no-store');
        if (csrfToken) {
            res.cookie('XSRF-TOKEN', csrfToken, {
                httpOnly: false,
                secure: cookieSecure,
                sameSite: cookieSameSite,
                path: '/',
            });
        }
        res.status(200).json({ csrfToken });
    });
    app.useGlobalInterceptors(new performance_interceptor_1.PerformanceInterceptor());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('日本采销管理系统 API')
            .setDescription('采购、销售、订单管理、請求書生成API文档')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api', app, document);
    }
    app.use('/health', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    });
    app.setGlobalPrefix('api');
    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`日本采销管理系统后端服务已启动: http://localhost:${port}`);
    logger.log(`API文档地址: http://localhost:${port}/api`);
    logger.log(`文件上传目录: http://localhost:${port}/uploads`);
}
bootstrap();
//# sourceMappingURL=main.js.map