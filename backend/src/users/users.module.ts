import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { Customer } from './entities/customer.entity';
import { StaffService } from './staff.service';
import { CustomerService } from './customer.service';
import { StaffController } from './staff.controller';
import { CustomerController } from './customer.controller';

/**
 * 用户模块
 * 包含员工和客户管理
 */
@Module({
  imports: [TypeOrmModule.forFeature([Staff, Customer])],
  providers: [StaffService, CustomerService],
  controllers: [StaffController, CustomerController],
  exports: [StaffService, CustomerService],
})
export class UsersModule {}
