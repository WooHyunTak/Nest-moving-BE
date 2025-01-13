import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { CommonModule } from 'src/common/common.module';
import { CustomerRepository } from './customer.repository';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [CommonModule],
  controllers: [CustomerController],
  providers: [CustomerService, CustomerRepository, PrismaService],
  exports: [CustomerService, CustomerRepository],
})
export class CustomerModule {}
