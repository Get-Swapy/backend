import { OrderStatusVariant } from '../entities/p2p-order.entity';

export const SUPPORTED_FIAT_CURRENCIES = ['USD', 'EUR', 'GBP'] as const;
export type SupportedFiatCurrency = (typeof SUPPORTED_FIAT_CURRENCIES)[number];

export const validStatusTransitions = new Map<
  typeof OrderStatusVariant.tsType,
  (typeof OrderStatusVariant.tsType)[]
>([
  [
    OrderStatusVariant.WAITING_FOR_BUYER_CONFIRMATION,
    [OrderStatusVariant.WAITING_FOR_PAYMENT, OrderStatusVariant.CANCELLED],
  ],
  [
    OrderStatusVariant.WAITING_FOR_PAYMENT,
    [
      OrderStatusVariant.WAITING_FOR_PAYMENT_CONFIRMATION,
      OrderStatusVariant.CANCELLED,
    ],
  ],
  [
    OrderStatusVariant.WAITING_FOR_PAYMENT_CONFIRMATION,
    [OrderStatusVariant.COMPLETED, OrderStatusVariant.CANCELLED],
  ],
  [OrderStatusVariant.CANCELLED, []],
  [OrderStatusVariant.COMPLETED, []],
]);
