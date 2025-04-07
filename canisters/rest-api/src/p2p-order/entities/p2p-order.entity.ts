import { Record, Variant, nat64, text } from 'azle/experimental';

export const OrderStatusVariant = Variant({
  PENDING_CONFIRMATION: null,
  PENDING_PAYMENT: null,
  PAYMENT_MARKED: null,
  COMPLETED: null,
  CANCELLED: null,
});

export const OrderStatus = {
  PENDING_CONFIRMATION: { PENDING_CONFIRMATION: null },
  PENDING_PAYMENT: { PENDING_PAYMENT: null },
  PAYMENT_MARKED: { PAYMENT_MARKED: null },
  COMPLETED: { COMPLETED: null },
  CANCELLED: { CANCELLED: null },
};

export function stringToOrderStatus(status: string) {
  switch (status) {
    case 'PENDING_CONFIRMATION':
      return OrderStatus.PENDING_CONFIRMATION;
    case 'PENDING_PAYMENT':
      return OrderStatus.PENDING_PAYMENT;
    case 'PAYMENT_MARKED':
      return OrderStatus.PAYMENT_MARKED;
    case 'COMPLETED':
      return OrderStatus.COMPLETED;
    case 'CANCELLED':
      return OrderStatus.CANCELLED;
    default:
      throw new Error(`Invalid order status: ${status}`);
  }
}

export function orderStatusToString(
  status: typeof OrderStatusVariant.tsType,
): string {
  if ('PENDING_CONFIRMATION' in status) return 'PENDING_CONFIRMATION';
  if ('PENDING_PAYMENT' in status) return 'PENDING_PAYMENT';
  if ('PAYMENT_MARKED' in status) return 'PAYMENT_MARKED';
  if ('COMPLETED' in status) return 'COMPLETED';
  if ('CANCELLED' in status) return 'CANCELLED';
  throw new Error('Invalid order status variant');
}

export const P2pOrder = Record({
  id: text,
  sellerId: text,
  buyerId: text,
  tokenId: text,
  amount: nat64,
  fiatAmount: nat64,
  fiatCurrency: text,
  status: OrderStatusVariant,
  cancellationReason: text,
  createdAt: nat64,
  updatedAt: nat64,
});

export type P2pOrder = typeof P2pOrder.tsType;
