import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Customer extends Document {
  @Prop({ required: true, unique: true })
  customerId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
