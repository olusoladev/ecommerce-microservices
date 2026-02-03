import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './transaction.schema';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async saveTransaction(data: {
    customerId: string;
    orderId: string;
    productId: string;
    paymentId: string;
    amount: number;
    status: string;
  }) {
    return this.transactionModel.create(data);
  }

}
