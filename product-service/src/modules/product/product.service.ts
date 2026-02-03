import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './product.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async findByProductId(productId: string): Promise<Product> {
    const product = await this.productModel.findOne({ productId });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async seedProducts(): Promise<void> {
    const count = await this.productModel.countDocuments();
    if (count > 0) return;

    await this.productModel.insertMany([
      {
        productId: 'prod-1',
        name: 'MacBook Pro',
        price: 2500,
      },
      {
        productId: 'prod-2',
        name: 'iPhone 15',
        price: 1200,
      },
    ]);

    console.log('Products seeded');
  }
}
