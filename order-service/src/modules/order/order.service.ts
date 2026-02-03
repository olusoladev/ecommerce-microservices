import { Injectable, Inject, HttpException, HttpStatus, NotFoundException, ServiceUnavailableException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './order.schema';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderCreatedEvent } from './interface/index.interface';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @Inject('CUSTOMER_SERVICE') private customerClient: ClientProxy,
    @Inject('PRODUCT_SERVICE') private productClient: ClientProxy,
    @Inject('PAYMENT_SERVICE') private paymentClient: ClientProxy,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderCreatedEvent> {
    const { customerId, productId } = createOrderDto;

    // Validate Customer via TCP
    let customer: any;

    try {
      customer = await firstValueFrom(
        this.customerClient.send({ cmd: 'get_customer' }, customerId)
      );
    } catch (err) {
      throw new ServiceUnavailableException('Customer service unavailable');
    }

    if (!customer) {
      throw new BadRequestException('Customer not found');
    }

    // Validate Product via TCP
    let product: any;

    try {
      product = await firstValueFrom(
        this.productClient.send({ cmd: 'get_product' }, productId)
      );
    } catch (err) {
      throw new HttpException('Product service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.BAD_REQUEST);
    }

    // Save Order in MongoDB
    const orderId = `ORD-${Date.now()}`;
    const order = await this.orderModel.create({
      customerId,
      productId,
      orderId,
      amount: product.price,
    });

    // Call Payment Service via TCP
    let payment: any;
    try {
      payment = await firstValueFrom(
        this.paymentClient.send({ cmd: 'process_payment' }, orderId)
      );
    } catch (err) {
      throw new ServiceUnavailableException('Payment service unavailable');
    }

    return {
      customerId,
      productId,
      orderId,
      orderStatus: order.orderStatus,
      paymentLink: payment?.paymentLink
    };
  }

  async findByOrderId(orderId: string): Promise<Order> {
    const order = await this.orderModel.findOne({ orderId }).lean();
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    return order;
  }

}
