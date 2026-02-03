import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { GenericResponse, IResponse } from 'src/interfaces/response.interface';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @MessagePattern({ cmd: 'process_payment' })
  async processPayment(orderId: string) {
    const payment = await this.paymentService.createPayment(orderId);
    return { orderId: payment.orderId, paymentLink: payment.paymentLink };
  }

  @Get('pay/:orderId')
  async pay(@Param('orderId') orderId: string): Promise<IResponse<GenericResponse>> {
    const payment = await this.paymentService.completePayment(orderId);
    return {
      message: `Payment successful for order ${orderId}`,
      data: payment,
      status: HttpStatus.OK,
    };
  }
}
