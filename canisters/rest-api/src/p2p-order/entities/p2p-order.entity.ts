import { Record, Variant, nat64, text } from 'azle/experimental';

export const OrderStatusVariant = Variant({
  WAITING_FOR_BUYER_CONFIRMATION: null,
  WAITING_FOR_PAYMENT: null,
  WAITING_FOR_PAYMENT_CONFIRMATION: null,
  COMPLETED: null,
  CANCELLED: null,
});

export type OrderStatusVariant = typeof OrderStatusVariant.tsType;

export function stringToOrderStatus(status: string) {
  switch (status) {
    case 'WAITING_FOR_BUYER_CONFIRMATION':
      return OrderStatusVariant.WAITING_FOR_BUYER_CONFIRMATION;
    case 'WAITING_FOR_PAYMENT':
      return OrderStatusVariant.WAITING_FOR_PAYMENT;
    case 'WAITING_FOR_PAYMENT_CONFIRMATION':
      return OrderStatusVariant.WAITING_FOR_PAYMENT_CONFIRMATION;
    case 'COMPLETED':
      return OrderStatusVariant.COMPLETED;
    case 'CANCELLED':
      return OrderStatusVariant.CANCELLED;
    default:
      throw new Error(`Invalid order status: ${status}`);
  }
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

export function orderStatusToString(status: OrderStatusVariant): string {
  if (!status || typeof status !== 'object') {
    throw new Error('Invalid status object');
  }

  const keys = Object.keys(status);
  if (keys.length !== 1) {
    throw new Error('Invalid status variant format');
  }

  return keys[0];
}
