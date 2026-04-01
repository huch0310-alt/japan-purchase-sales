/**
 * 分类数据传输对象
 */
import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 分类列表项响应DTO
 */
export class CategoryResponseDto {
  id: string;
  nameZh: string;
  nameJa: string;
  nameEn: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;

  constructor(partial: Partial<CategoryResponseDto>) {
    Object.assign(this, partial);
  }
}

/**
 * 创建分类请求DTO
 */
export class CreateCategoryDto {
  @ApiProperty({ description: '中文名称' })
  @IsString()
  nameZh: string;

  @ApiProperty({ description: '日文名称' })
  @IsString()
  nameJa: string;

  @ApiProperty({ description: '英文名称' })
  @IsString()
  nameEn: string;

  @ApiPropertyOptional({ description: '排序顺序', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

/**
 * 更新分类请求DTO
 */
export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: '中文名称' })
  @IsOptional()
  @IsString()
  nameZh?: string;

  @ApiPropertyOptional({ description: '日文名称' })
  @IsOptional()
  @IsString()
  nameJa?: string;

  @ApiPropertyOptional({ description: '英文名称' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ description: '排序顺序' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
