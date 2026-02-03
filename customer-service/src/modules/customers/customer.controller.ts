import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { IResponse } from 'src/interfaces/response.interface';
import { Customer } from './customer.schema';
import { MessagePattern } from '@nestjs/microservices';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get(':id')
  async getCustomer(@Param('id') id: string): Promise<IResponse<Customer>> {
    const customer = await this.customerService.findByCustomerId(id);
    return {  
      data: customer,
      status: HttpStatus.OK,
      message: 'Customer retrieved successfully',
    };
  }

  @MessagePattern({ cmd: 'get_customer' })
  findByCustomerId(customerId: string) {
    return this.customerService.findByCustomerId(customerId);
  }
}
