/**
 * 单位数据传输对象
 */
import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 创建单位请求DTO
 */
export class CreateUnitDto {
  @ApiProperty({ description: '单位名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '排序顺序', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

/**
 * 更新单位请求DTO
 */
export class UpdateUnitDto {
  @ApiPropertyOptional({ description: '单位名称' })
  @IsOptional()
  @IsString()
  name?: string;

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
