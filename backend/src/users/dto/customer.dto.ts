/**
 * 客户数据传输对象
 */
import { IsString, IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 创建客户请求DTO
 */
export class CreateCustomerDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  password: string;

  @ApiProperty({ description: '公司名称' })
  @IsString()
  companyName: string;

  @ApiPropertyOptional({ description: '地址' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: '联系人' })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiPropertyOptional({ description: '电话' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'VIP折扣(0-100)', default: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  vipDiscount?: number;
}

/**
 * 更新客户请求DTO
 */
export class UpdateCustomerDto {
  @ApiPropertyOptional({ description: '公司名称' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ description: '地址' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: '联系人' })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiPropertyOptional({ description: '电话' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'VIP折扣(0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  vipDiscount?: number;

  @ApiPropertyOptional({ description: '发票抬头' })
  @IsOptional()
  @IsString()
  invoiceName?: string;

  @ApiPropertyOptional({ description: '发票地址' })
  @IsOptional()
  @IsString()
  invoiceAddress?: string;

  @ApiPropertyOptional({ description: '发票电话' })
  @IsOptional()
  @IsString()
  invoicePhone?: string;

  @ApiPropertyOptional({ description: '发票银行' })
  @IsOptional()
  @IsString()
  invoiceBank?: string;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
