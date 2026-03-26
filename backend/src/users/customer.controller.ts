import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * 客户控制器
 * 处理客户管理相关请求
 */
@ApiTags('客户管理')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  /**
   * 获取所有客户列表
   */
  @Get()
  @Roles('super_admin', 'admin', 'procurement', 'sales')
  @ApiOperation({ summary: '获取所有客户列表' })
  async findAll(@Query('keyword') keyword?: string) {
    if (keyword) {
      const customers = await this.customerService.searchByCompanyName(keyword);
      return customers.map(c => {
        const { passwordHash, ...result } = c as any;
        return result;
      });
    }
    const customers = await this.customerService.findAll();
    return customers.map(c => {
      const { passwordHash, ...result } = c as any;
      return result;
    });
  }

  /**
   * 根据ID获取客户详情
   */
  @Get(':id')
  @Roles('super_admin', 'admin', 'sales')
  @ApiOperation({ summary: '获取客户详情' })
  async findOne(@Param('id') id: string) {
    const customer = await this.customerService.findById(id);
    if (!customer) {
      throw new Error('客户不存在');
    }
    const { passwordHash, ...result } = customer as any;
    return result;
  }

  /**
   * 创建新客户
   */
  @Post()
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: '创建新客户' })
  async create(@Body() createCustomerDto: {
    username: string;
    password: string;
    companyName: string;
    address: string;
    contactPerson: string;
    phone: string;
    vipDiscount?: number;
    invoiceName?: string;
    invoiceAddress?: string;
    invoicePhone?: string;
    invoiceBank?: string;
  }) {
    return this.customerService.create(createCustomerDto);
  }

  /**
   * 更新客户信息
   */
  @Put(':id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: '更新客户信息' })
  async update(@Param('id') id: string, @Body() updateCustomerDto: any) {
    return this.customerService.update(id, updateCustomerDto);
  }

  /**
   * 删除客户
   */
  @Delete(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: '删除客户' })
  async delete(@Param('id') id: string) {
    await this.customerService.delete(id);
    return { message: '删除成功' };
  }
}
