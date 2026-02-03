import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;
}
