import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * 设置控制器
 */
@ApiTags('系统设置')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: '获取所有设置' })
  async findAll() {
    return this.settingService.findAll();
  }

  @Get(':key')
  @ApiOperation({ summary: '获取单个设置' })
  async findOne(@Param('key') key: string) {
    return this.settingService.get(key);
  }

  @Post()
  @Roles('super_admin')
  @ApiOperation({ summary: '批量设置' })
  async setMultiple(@Body() body: { key: string; value: string; description?: string }[]) {
    await this.settingService.setMultiple(body);
    return { message: '设置成功' };
  }

  @Put(':key')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: '更新设置' })
  async set(@Body() body: { key: string; value: string; description?: string }) {
    return this.settingService.set(body.key, body.value, body.description);
  }
}
