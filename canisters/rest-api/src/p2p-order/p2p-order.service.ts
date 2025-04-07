import { Injectable } from '@nestjs/common';
import { StableBTreeMap } from 'azle';
import { text } from 'azle/experimental';
import { v4 as uuidv4 } from 'uuid';

import {
  OrderStatus,
  OrderStatusVariant,
  P2pOrder,
  orderStatusToString,
} from './entities/p2p-order.entity';
import { UserService } from '../user/user.service';
import { TokenService } from '../wallet/token.service';
import { WalletService } from '../wallet/wallet.service';

const p2pOrders = new StableBTreeMap<text, P2pOrder>(1);

const validStatusTransitions = new Map<
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

type CreateOrderData = {
  sellerId: string;
  buyerId: string;
  tokenId: string;
  amount: number;
  fiatAmount: number;
  fiatCurrency: string;
};

type ConfirmOrderData = {
  orderId: string;
};

type MarkAsPaidData = {
  orderId: string;
};

type ConfirmPaymentData = {
  orderId: string;
};

@Injectable()
export class P2pOrderService {
  constructor(
    private readonly userService: UserService,
    private readonly walletService: WalletService,
    private readonly tokenService: TokenService,
  ) {}

  private validateStatusTransition(
    currentStatus: typeof OrderStatusVariant.tsType,
    newStatus: typeof OrderStatusVariant.tsType,
  ): void {
    const allowedTransitions = validStatusTransitions.get(currentStatus);
    if (!allowedTransitions) {
      throw new Error(
        `Invalid current status: ${orderStatusToString(currentStatus)}`,
      );
    }
    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${orderStatusToString(currentStatus)} to ${orderStatusToString(newStatus)}`,
      );
    }
  }

  public getAll(): P2pOrder[] {
    return p2pOrders.values();
  }

  public getById(orderId: string): P2pOrder {
    const maybeOrder = p2pOrders.get(orderId);
    if (!maybeOrder) throw new Error('Order not found');
    return maybeOrder;
  }

  public getBySellerId(sellerId: string): P2pOrder[] {
    return p2pOrders.values().filter((order) => order.sellerId === sellerId);
  }

  public getByBuyerId(buyerId: string): P2pOrder[] {
    return p2pOrders.values().filter((order) => order.buyerId === buyerId);
  }

  public create(data: CreateOrderData): P2pOrder {
    const seller = this.userService.getById(data.sellerId);
    if (!seller) throw new Error('Seller not found');

    const buyer = this.userService.getById(data.buyerId);
    if (!buyer) throw new Error('Buyer not found');

    if (!this.tokenService.isTokenSupported(data.tokenId)) {
      throw new Error(`Token ${data.tokenId} is not supported`);
    }

    const orderId = uuidv4();
    const now = BigInt(Date.now());

    const newOrder: P2pOrder = {
      id: orderId,
      sellerId: data.sellerId,
      buyerId: data.buyerId,
      tokenId: data.tokenId,
      amount: BigInt(data.amount),
      fiatAmount: BigInt(data.fiatAmount),
      fiatCurrency: data.fiatCurrency,
      status: OrderStatus.PENDING_CONFIRMATION,
      cancellationReason: '',
      createdAt: now,
      updatedAt: now,
    };

    p2pOrders.insert(orderId, newOrder);
    return newOrder;
  }

  public confirmOrder(data: ConfirmOrderData): P2pOrder {
    const order = this.getById(data.orderId);

    this.validateStatusTransition(order.status, OrderStatus.PENDING_PAYMENT);

    const updatedOrder: P2pOrder = {
      ...order,
      status: OrderStatus.PENDING_PAYMENT,
      updatedAt: BigInt(Date.now()),
    };

    p2pOrders.insert(order.id, updatedOrder);
    return updatedOrder;
  }

  public markAsPaid(data: MarkAsPaidData): P2pOrder {
    const order = this.getById(data.orderId);

    this.validateStatusTransition(order.status, OrderStatus.PAYMENT_MARKED);

    const updatedOrder: P2pOrder = {
      ...order,
      status: OrderStatus.PAYMENT_MARKED,
      updatedAt: BigInt(Date.now()),
    };

    p2pOrders.insert(order.id, updatedOrder);
    return updatedOrder;
  }

  public confirmPayment(data: ConfirmPaymentData): P2pOrder {
    const order = this.getById(data.orderId);

    this.validateStatusTransition(order.status, OrderStatus.COMPLETED);

    if (!this.tokenService.isTokenSupported(order.tokenId)) {
      throw new Error(`Token ${order.tokenId} is not supported`);
    }

    this.walletService.transferToUser({
      from: order.sellerId,
      to: order.buyerId,
      token: order.tokenId,
      amount: Number(order.amount),
    });

    const updatedOrder: P2pOrder = {
      ...order,
      status: OrderStatus.COMPLETED,
      updatedAt: BigInt(Date.now()),
    };

    p2pOrders.insert(order.id, updatedOrder);
    return updatedOrder;
  }

  public cancelOrder(orderId: string, reason: string): P2pOrder {
    if (!reason) {
      throw new Error('A cancellation reason is required');
    }

    const order = this.getById(orderId);

    this.validateStatusTransition(order.status, OrderStatus.CANCELLED);

    const updatedOrder: P2pOrder = {
      ...order,
      status: OrderStatus.CANCELLED,
      cancellationReason: reason,
      updatedAt: BigInt(Date.now()),
    };

    p2pOrders.insert(order.id, updatedOrder);
    return updatedOrder;
  }
}
