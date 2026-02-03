import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ProductService } from './product.service';
import { IResponse } from 'src/interfaces/response.interface';
import { Product } from './product.schema';
import { MessagePattern } from '@nestjs/microservices';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll(@Param('id') id: string): Promise<IResponse<Product[]>> {
    const product = await this.productService.findAll();
    return {  
      data: product,
      status: HttpStatus.OK,
      message: 'Product retrieved successfully',
    };
  }

  @Get(':id')
  async getProduct(@Param('id') id: string): Promise<IResponse<Product>> {
    const product = await this.productService.findByProductId(id);
    return {  
      data: product,
      status: HttpStatus.OK,
      message: 'Product retrieved successfully',
    };
  }

  @MessagePattern({ cmd: 'get_product' })
  findByCustomerId(productId: string) {
    return this.productService.findByProductId(productId);
  }
}
