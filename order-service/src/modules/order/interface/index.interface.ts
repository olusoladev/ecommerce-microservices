export interface OrderCreatedEvent {
  customerId: string;
  productId: string;
  orderId: string;
  orderStatus: string;
  paymentLink: string;
}