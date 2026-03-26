import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { EventService } from '../common/services/event.service';

/**
 * 商品服务
 * 处理商品相关的数据库操作
 */
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @Inject(forwardRef(() => EventService))
    private eventService: EventService,
  ) {}

  /**
   * 根据ID查找商品
   */
  async findById(id: string): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { id },
      relations: ['category']
    });
  }

  /**
   * 查询所有商品（可筛选）
   */
  async findAll(filters?: {
    categoryId?: string;
    status?: string;
    keyword?: string;
  }): Promise<Product[]> {
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (filters?.categoryId) {
      query.andWhere('product.category_id = :categoryId', { categoryId: filters.categoryId });
    }
    if (filters?.status) {
      query.andWhere('product.status = :status', { status: filters.status });
    }
    if (filters?.keyword) {
      query.andWhere('product.name LIKE :keyword', { keyword: `%${filters.keyword}%` });
    }

    return query.orderBy('product.createdAt', 'DESC').getMany();
  }

  /**
   * 查询待审核商品（采购提交的商品）
   */
  async findPending(): Promise<Product[]> {
    return this.productRepository.find({
      where: { status: 'pending' },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 查询已审核通过且上架的商品（客户可见）
   */
  async findActive(): Promise<Product[]> {
    return this.productRepository.find({
      where: { status: 'active' },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 创建商品（采购端采集）
   */
  async create(data: {
    name: string;
    quantity?: number;
    unit?: string;
    description?: string;
    categoryId?: string;
    createdBy: string;
  }): Promise<Product> {
    const product = this.productRepository.create({
      ...data,
      status: 'pending',  // 初始状态为待审核
    });
    return this.productRepository.save(product);
  }

  /**
   * 审核商品（销售端审核）
   * 状态校验：只能审核待审核状态的商品
   */
  async approve(id: string, salePrice: number): Promise<Product> {
    const product = await this.findById(id);
    if (!product) {
      throw new Error('商品不存在');
    }
    if (product.status !== 'pending') {
      throw new Error(`商品状态不是待审核，无法审核。当前状态：${product.status}`);
    }
    await this.productRepository.update(id, {
      status: 'approved',
      salePrice,
    });
    const updatedProduct = await this.findById(id);
    // 发送商品审核通过通知
    if (updatedProduct) {
      this.eventService.notifyProductApproved(updatedProduct);
    }
    return updatedProduct;
  }

  /**
   * 拒绝商品
   * 状态校验：只能拒绝待审核状态的商品
   */
  async reject(id: string): Promise<Product> {
    const product = await this.findById(id);
    if (!product) {
      throw new Error('商品不存在');
    }
    if (product.status !== 'pending') {
      throw new Error(`商品状态不是待审核，无法拒绝。当前状态：${product.status}`);
    }
    await this.productRepository.update(id, { status: 'rejected' });
    const rejectedProduct = await this.findById(id);
    // 发送商品审核拒绝通知
    if (rejectedProduct) {
      this.eventService.notifyProductRejected(rejectedProduct);
    }
    return rejectedProduct;
  }

  /**
   * 上架商品
   * 状态校验：只能上架已审核状态的商品
   */
  async activate(id: string): Promise<Product> {
    const product = await this.findById(id);
    if (!product) {
      throw new Error('商品不存在');
    }
    if (product.status !== 'approved') {
      throw new Error(`商品状态不是已审核，无法上架。当前状态：${product.status}`);
    }
    await this.productRepository.update(id, { status: 'active' });
    return this.findById(id);
  }

  /**
   * 下架商品
   * 状态校验：只能下架上架状态的商品
   */
  async deactivate(id: string): Promise<Product> {
    const product = await this.findById(id);
    if (!product) {
      throw new Error('商品不存在');
    }
    if (product.status !== 'active') {
      throw new Error(`商品状态不是上架，无法下架。当前状态：${product.status}`);
    }
    await this.productRepository.update(id, { status: 'inactive' });
    return this.findById(id);
  }

  /**
   * 批量下架商品
   */
  async batchDeactivate(ids: string[]): Promise<void> {
    await this.productRepository.update(ids, { status: 'inactive' });
  }

  /**
   * 更新商品信息
   */
  async update(id: string, data: Partial<Product>): Promise<Product> {
    await this.productRepository.update(id, data);
    return this.findById(id);
  }

  /**
   * 删除商品
   */
  async delete(id: string): Promise<void> {
    await this.productRepository.delete(id);
  }

  /**
   * 获取热销商品排行
   * 根据销售数量排序
   */
  async findHotProducts(limit: number = 10): Promise<Product[]> {
    return this.productRepository.find({
      where: { status: 'active' },
      relations: ['category'],
      order: { salesCount: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
  }
}
