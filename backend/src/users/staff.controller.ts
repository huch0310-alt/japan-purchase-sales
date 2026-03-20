import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * 员工控制器
 * 处理员工管理相关请求
 */
@ApiTags('员工管理')
@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  /**
   * 获取所有员工列表
   */
  @Get()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: '获取所有员工列表' })
  async findAll() {
    const staff = await this.staffService.findAll();
    return staff.map(s => {
      const { passwordHash, ...result } = s as any;
      return result;
    });
  }

  /**
   * 根据ID获取员工详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取员工详情' })
  async findOne(@Param('id') id: string) {
    const staff = await this.staffService.findById(id);
    if (!staff) {
      throw new Error('员工不存在');
    }
    const { passwordHash, ...result } = staff as any;
    return result;
  }

  /**
   * 创建新员工
   */
  @Post()
  @Roles('super_admin')
  @ApiOperation({ summary: '创建新员工' })
  async create(@Body() createStaffDto: {
    username: string;
    password: string;
    name: string;
    phone?: string;
    role: string;
  }) {
    return this.staffService.create(createStaffDto);
  }

  /**
   * 更新员工信息
   */
  @Put(':id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: '更新员工信息' })
  async update(@Param('id') id: string, @Body() updateStaffDto: any) {
    return this.staffService.update(id, updateStaffDto);
  }

  /**
   * 删除员工
   */
  @Delete(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: '删除员工' })
  async delete(@Param('id') id: string) {
    await this.staffService.delete(id);
    return { message: '删除成功' };
  }
}
