import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: ['success', 'failed', 'pending'] })
  status: string;

  @Prop()
  paymentLink: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
