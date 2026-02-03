import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from './customer.schema';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name)
    private customerModel: Model<Customer>,
  ) {}

  async findByCustomerId(customerId: string): Promise<Customer> {
    const customer = await this.customerModel.findOne({ customerId });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async seedCustomer(): Promise<void> {
    const exists = await this.customerModel.findOne({ customerId: 'cust-1' });
    if (exists) return;

    await this.customerModel.create({
      customerId: 'cust-1',
      name: 'Sola Paul',
      email: 'sola@example.com',
    });
  }
}
