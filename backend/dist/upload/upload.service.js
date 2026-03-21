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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const cos_nodejs_sdk_v5_1 = __importDefault(require("cos-nodejs-sdk-v5"));
let UploadService = class UploadService {
    constructor(configService) {
        this.configService = configService;
        this.initCos();
    }
    initCos() {
        const secretId = this.configService.get('TENCENT_COS_SECRET_ID');
        const secretKey = this.configService.get('TENCENT_COS_SECRET_KEY');
        this.bucket = this.configService.get('TENCENT_COS_BUCKET');
        this.region = this.configService.get('TENCENT_COS_REGION', 'ap-tokyo');
        if (secretId && secretKey && this.bucket) {
            this.cos = new cos_nodejs_sdk_v5_1.default({
                SecretId: secretId,
                SecretKey: secretKey,
            });
        }
    }
    getUploadDir() {
        return this.configService.get('UPLOAD_DIR', './uploads');
    }
    async ensureUploadDir() {
        const uploadDir = this.getUploadDir();
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
    }
    getFileUrl(filePath) {
        const baseUrl = this.configService.get('BASE_URL', 'http://localhost:3001');
        return `${baseUrl}${filePath}`;
    }
    async deleteFile(filePath) {
        if (filePath.includes('cos.')) {
            await this.deleteFromCos(filePath);
            return;
        }
        const fullPath = path.join(process.cwd(), filePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }
    async uploadToCos(file) {
        if (!this.cos) {
            throw new Error('腾讯云COS未配置');
        }
        const key = `uploads/${Date.now()}-${file.originalname}`;
        return new Promise((resolve, reject) => {
            this.cos.putObject({
                Bucket: this.bucket,
                Region: this.region,
                Key: key,
                Body: fs.createReadStream(file.path),
                onProgress: (progress) => {
                    console.log('上传进度:', progress.percent);
                },
            }, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(`https://${this.bucket}.cos.${this.region}.myqcloud.com/${key}`);
                }
            });
        });
    }
    async deleteFromCos(fileUrl) {
        if (!this.cos) {
            throw new Error('腾讯云COS未配置');
        }
        const key = fileUrl.replace(`https://${this.bucket}.cos.${this.region}.myqcloud.com/`, '');
        return new Promise((resolve, reject) => {
            this.cos.deleteObject({
                Bucket: this.bucket,
                Region: this.region,
                Key: key,
            }, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    isCosConfigured() {
        return !!this.cos;
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map