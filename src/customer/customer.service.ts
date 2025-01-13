import { Injectable } from '@nestjs/common';
import { CustomerRepository } from './customer.repository';
import { CreateCustomerDto } from './dto/create.customer.dto';
import { UpdateCustomerDto } from './dto/update.customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async createCustomer(userId: number, body: CreateCustomerDto) {
    const profile = {
      userId,
      name: body.name,
      imageUrl: body.imageUrl[0],
      regions: body.regions,
      services: body.services,
    };
    const customer = await this.customerRepository.create(profile);
    return customer;
  }

  async updateCustomer(customerId: number, body: UpdateCustomerDto) {
    const customer = await this.customerRepository.update(customerId, body);
    return customer;
  }
}
