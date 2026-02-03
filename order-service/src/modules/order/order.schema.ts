import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'pending' })
  orderStatus: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
