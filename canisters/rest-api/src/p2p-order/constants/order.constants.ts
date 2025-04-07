import { OrderStatus, OrderStatusVariant } from '../entities/p2p-order.entity';

export const validStatusTransitions = new Map<
  typeof OrderStatusVariant.tsType,
  (typeof OrderStatusVariant.tsType)[]
>([
  [
    OrderStatus.PENDING_CONFIRMATION,
    [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED],
  ],
  [
    OrderStatus.PENDING_PAYMENT,
    [OrderStatus.PAYMENT_MARKED, OrderStatus.CANCELLED],
  ],
  [OrderStatus.PAYMENT_MARKED, [OrderStatus.COMPLETED, OrderStatus.CANCELLED]],
  [OrderStatus.CANCELLED, []],
  [OrderStatus.COMPLETED, []],
]);

export enum FiatCurrency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}
