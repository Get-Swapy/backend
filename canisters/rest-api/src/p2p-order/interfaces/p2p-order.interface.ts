import { FiatCurrency } from '../constants/order.constants';
import { P2pOrder } from '../entities/p2p-order.entity';

export interface CreateOrderData {
  sellerId: string;
  buyerId: string;
  tokenId: string;
  amount: number;
  fiatAmount: number;
  fiatCurrency: FiatCurrency;
}

export interface OrderOperationData {
  orderId: string;
}

export interface OrderResponse {
  order: P2pOrder;
  message: string;
}
