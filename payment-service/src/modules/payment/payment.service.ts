import { BadRequestException, Inject, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './payment.schema';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  private readonly frontendAppUrl: string;
  constructor(
    @Inject('RABBITMQ_CLIENT')
    private readonly rabbitClient: ClientProxy,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @Inject('ORDER_SERVICE') private orderClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {
    this.frontendAppUrl = this.configService.get<string>('FRONTEND_APP_URL') as string;
  }

  // Called by Order Service (TCP)
  async createPayment(orderId: string): Promise<Payment> {
    // Validate Customer via TCP
    let order: any;

    try {
      order = await firstValueFrom(
        this.orderClient.send({ cmd: 'get_order_by_id' }, orderId)
      );
    } catch (err) {
      throw new ServiceUnavailableException('Order service unavailable');
    }

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    const paymentLink = `${this.frontendAppUrl}/pay/${orderId}`;

    const payment = await this.paymentModel.create({
      orderId: order.orderId,
      customerId: order.customerId,
      productId: order.productId,
      amount: order.amount,
      status: 'pending',
      paymentLink,
    });

    return payment;
  }

  async completePayment(orderId: string): Promise<Payment> {
    const payment = await this.paymentModel.findOne({ orderId });
    if (!payment) throw new NotFoundException('Payment not found');

    payment.status = 'success';
    await payment.save();

    this.rabbitClient.emit('payment_completed', {
      customerId: payment.customerId,
      orderId: payment.orderId,
      productId: payment.productId,
      paymentId: payment._id.toString(),
      amount: payment.amount,
      status: payment.status,
    });

    return payment;
  }

  async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
    return this.paymentModel.findOne({ orderId }).lean();
  }
}
