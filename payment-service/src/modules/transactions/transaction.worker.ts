import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TransactionService } from './transaction.service';

@Controller()
export class TransactionWorker {
  constructor(private readonly transactionService: TransactionService) {}

  @EventPattern('payment_completed')
  async handlePaymentCompleted(@Payload() data: any) {
    await this.transactionService.saveTransaction(data);
  }
}
