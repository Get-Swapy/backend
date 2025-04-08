import { OrderStatus, OrderStatusVariant } from '../entities/p2p-order.entity';

export const SUPPORTED_FIAT_CURRENCIES = ['USD', 'EUR', 'GBP'] as const;
export type SupportedFiatCurrency = (typeof SUPPORTED_FIAT_CURRENCIES)[number];

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
