import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * 商品控制器
 * 处理商品管理相关请求
 */
@ApiTags('商品管理')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * 获取所有商品（客户可见 - 已上架）
   */
  @Get('active')
  @ApiOperation({ summary: '获取已上架商品列表（客户可见）' })
  async findActive(@Query('categoryId') categoryId?: string) {
    return this.productsService.findAll({ categoryId, status: 'active' });
  }

  /**
   * 获取待审核商品（销售端）
   */
  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'sales')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取待审核商品列表' })
  async findPending() {
    return this.productsService.findPending();
  }

  /**
   * 获取所有商品（管理后台）
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'procurement', 'sales')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取所有商品列表（管理后台）' })
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.productsService.findAll({ categoryId, status, keyword });
  }

  /**
   * 获取商品详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取商品详情' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  /**
   * 采购端：采集商品
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'procurement')
  @ApiBearerAuth()
  @ApiOperation({ summary: '采购端采集商品' })
  async create(@Request() req, @Body() createProductDto: {
    name: string;
    quantity?: number;
    unit?: string;
    description?: string;
    categoryId?: string;
  }) {
    const userId = req.user.id;
    return this.productsService.create({
      ...createProductDto,
      createdBy: userId,
    });
  }

  /**
   * 销售端：审核通过商品
   */
  @Put(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'sales')
  @ApiBearerAuth()
  @ApiOperation({ summary: '审核通过商品并设置销售价' })
  async approve(@Param('id') id: string, @Body() body: { salePrice: number }) {
    return this.productsService.approve(id, body.salePrice);
  }

  /**
   * 销售端：拒绝商品
   */
  @Put(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'sales')
  @ApiBearerAuth()
  @ApiOperation({ summary: '拒绝商品' })
  async reject(@Param('id') id: string) {
    return this.productsService.reject(id);
  }

  /**
   * 销售端：上架商品
   */
  @Put(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'sales')
  @ApiBearerAuth()
  @ApiOperation({ summary: '上架商品' })
  async activate(@Param('id') id: string) {
    return this.productsService.activate(id);
  }

  /**
   * 销售端：下架商品
   */
  @Put(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'sales')
  @ApiBearerAuth()
  @ApiOperation({ summary: '下架商品' })
  async deactivate(@Param('id') id: string) {
    return this.productsService.deactivate(id);
  }

  /**
   * 销售端：批量下架商品
   */
  @Put('batch/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'sales')
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量下架商品' })
  async batchDeactivate(@Body() body: { ids: string[] }) {
    await this.productsService.batchDeactivate(body.ids);
    return { message: '批量下架成功' };
  }

  /**
   * 更新商品信息
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'sales')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新商品信息' })
  async update(@Param('id') id: string, @Body() updateProductDto: any) {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * 删除商品
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除商品' })
  async delete(@Param('id') id: string) {
    await this.productsService.delete(id);
    return { message: '删除成功' };
  }

  /**
   * 获取热销商品排行
   */
  @Get('stats/hot')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'sales')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取热销商品排行' })
  async findHotProducts(@Query('limit') limit?: number) {
    return this.productsService.findHotProducts(limit || 10);
  }
}
