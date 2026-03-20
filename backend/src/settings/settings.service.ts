import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';

/**
 * 设置服务
 */
@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,
  ) {}

  /**
   * 获取设置值
   */
  async getValue(key: string): Promise<string | null> {
    const setting = await this.settingRepository.findOne({ where: { key } });
    return setting ? setting.value : null;
  }

  /**
   * 获取所有设置
   */
  async findAll(): Promise<Setting[]> {
    return this.settingRepository.find();
  }

  /**
   * 设置值
   */
  async set(key: string, value: string, description?: string): Promise<Setting> {
    let setting = await this.settingRepository.findOne({ where: { key } });
    if (setting) {
      setting.value = value;
      if (description) setting.description = description;
    } else {
      setting = this.settingRepository.create({ key, value, description });
    }
    return this.settingRepository.save(setting);
  }

  /**
   * 批量设置
   */
  async setMultiple(settings: { key: string; value: string; description?: string }[]): Promise<void> {
    for (const s of settings) {
      await this.set(s.key, s.value, s.description);
    }
  }

  /**
   * 初始化默认设置
   */
  async initDefaultSettings(): Promise<void> {
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
}
