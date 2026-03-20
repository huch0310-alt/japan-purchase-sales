import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { SettingService } from './settings.service';
import { SettingsController } from './settings.controller';

/**
 * 系统设置模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([Setting])],
  providers: [SettingService],
  controllers: [SettingsController],
  exports: [SettingService],
})
export class SettingsModule {}
