/**
 * 员工数据传输对象
 */
import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 员工角色枚举
 */
export enum StaffRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  PROCUREMENT = 'procurement',
  SALES = 'sales',
}

/**
 * 创建员工请求DTO
 */
export class CreateStaffDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  password: string;

  @ApiProperty({ description: '姓名' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '电话' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: '角色', enum: StaffRole })
  @IsEnum(StaffRole)
  role: string;
}

/**
 * 更新员工请求DTO
 */
export class UpdateStaffDto {
  @ApiPropertyOptional({ description: '姓名' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '电话' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: '角色', enum: StaffRole })
  @IsOptional()
  @IsEnum(StaffRole)
  role?: string;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
