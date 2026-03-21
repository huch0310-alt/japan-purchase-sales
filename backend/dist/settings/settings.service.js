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
exports.SettingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const setting_entity_1 = require("./entities/setting.entity");
let SettingService = class SettingService {
    constructor(settingRepository) {
        this.settingRepository = settingRepository;
    }
    async get(key) {
        return this.getValue(key);
    }
    async getValue(key) {
        const setting = await this.settingRepository.findOne({ where: { key } });
        return setting ? setting.value : null;
    }
    async findAll() {
        return this.settingRepository.find();
    }
    async set(key, value, description) {
        let setting = await this.settingRepository.findOne({ where: { key } });
        if (setting) {
            setting.value = value;
            if (description)
                setting.description = description;
        }
        else {
            setting = this.settingRepository.create({ key, value, description });
        }
        return this.settingRepository.save(setting);
    }
    async setMultiple(settings) {
        for (const s of settings) {
            await this.set(s.key, s.value, s.description);
        }
    }
    async initDefaultSettings() {
        const defaults = [
            { key: 'company_name', value: '', description: '公司名称' },
            { key: 'company_address', value: '', description: '公司地址' },
            { key: 'company_phone', value: '', description: '公司电话' },
            { key: 'company_fax', value: '', description: '公司传真' },
            { key: 'company_email', value: '', description: '公司邮箱' },
            { key: 'company_representative', value: '', description: '负责人' },
            { key: 'company_legal_representative', value: '', description: '法人代表' },
            { key: 'company_bank', value: '', description: '银行账户' },
            { key: 'company_logo', value: '', description: '公司Logo URL' },
            { key: 'tax_rate', value: '10', description: '消费税率(%)' },
            { key: 'default_payment_days', value: '30', description: '默认账期(天)' },
        ];
        for (const s of defaults) {
            const existing = await this.settingRepository.findOne({ where: { key: s.key } });
            if (!existing) {
                await this.settingRepository.save(this.settingRepository.create(s));
            }
        }
    }
};
exports.SettingService = SettingService;
exports.SettingService = SettingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(setting_entity_1.Setting)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SettingService);
//# sourceMappingURL=settings.service.js.map