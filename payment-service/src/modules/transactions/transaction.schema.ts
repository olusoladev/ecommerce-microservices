import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  paymentId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: ['success', 'failed', 'pending'] })
  status: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
