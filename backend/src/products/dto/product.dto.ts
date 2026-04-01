/**
 * 商品数据传输对象
 */
import { IsString, IsOptional, IsNumber, IsEnum, Min, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 商品状态枚举
 */
export enum ProductStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * 创建商品请求DTO
 */
export class CreateProductDto {
  @ApiProperty({ description: '商品名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '库存数量', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ description: '单位' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: '商品描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '分类ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: '采购价格' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @ApiPropertyOptional({ description: '销售价格' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @ApiPropertyOptional({ description: '商品图片URL' })
  @IsOptional()
  @IsString()
  photoUrl?: string;
}

/**
 * 更新商品请求DTO
 */
export class UpdateProductDto {
  @ApiPropertyOptional({ description: '商品名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '库存数量' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ description: '单位' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: '商品描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '分类ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: '采购价格' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @ApiPropertyOptional({ description: '销售价格' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @ApiPropertyOptional({ description: '商品图片URL' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ description: '商品状态', enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: string;
}

/**
 * 商品审核DTO
 */
export class ApproveProductDto {
  @ApiProperty({ description: '销售价格' })
  @IsNumber()
  @Min(0)
  salePrice: number;
}
