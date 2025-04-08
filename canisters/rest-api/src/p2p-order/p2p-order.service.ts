import { Injectable } from '@nestjs/common';
import { StableBTreeMap } from 'azle';
import { text } from 'azle/experimental';
import { v4 as uuidv4 } from 'uuid';

import { UserService } from '../user/user.service';
import { SupportedTokens } from '../wallet/constants/tokens.constants';
import { TokenService } from '../wallet/token.service';
import { WalletService } from '../wallet/wallet.service';
import {
  OrderStatus,
  OrderStatusVariant,
  P2pOrder,
  orderStatusToString,
} from './entities/p2p-order.entity';
import {
  InsufficientBalanceException,
  InvalidOrderStatusException,
  InvalidOrderStatusTransitionException,
  P2POrderNotFoundException,
  P2POrderValidationException,
  UnsupportedTokenException,
} from './exceptions/p2p-order.exceptions';
import { UserNotFoundException } from '../user/exceptions/user.exception';

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
  tokenId: SupportedTokens;
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
      throw new InvalidOrderStatusException(
        'system',
        orderStatusToString(currentStatus),
        Object.values(OrderStatus).map((status) => orderStatusToString(status)),
      );
    }
    if (
      !allowedTransitions.some(
        (status) => Object.keys(status)[0] === Object.keys(newStatus)[0],
      )
    ) {
      throw new InvalidOrderStatusTransitionException(
        'system',
        orderStatusToString(currentStatus),
        orderStatusToString(newStatus),
        allowedTransitions.map((t) => orderStatusToString(t)),
      );
    }
  }

  private getBlockedBalance(userId: string, tokenId: SupportedTokens): bigint {
    return p2pOrders
      .values()
      .filter((order) => {
        const isFinalized =
          'COMPLETED' in order.status || 'CANCELLED' in order.status;
        return (
          order.sellerId === userId && order.tokenId === tokenId && !isFinalized
        );
      })
      .reduce((acc, order) => acc + order.amount, BigInt(0));
  }

  private updateOrderStatus(
    orderId: string,
    newStatus: typeof OrderStatusVariant.tsType,
  ): P2pOrder {
    const order = this.getById(orderId);

    this.validateStatusTransition(order.status, newStatus);

    const updatedOrder: P2pOrder = {
      ...order,
      status: newStatus,
      updatedAt: BigInt(Date.now()),
    };

    p2pOrders.insert(orderId, updatedOrder);

    return updatedOrder;
  }

  public getAll(): P2pOrder[] {
    return p2pOrders.values();
  }

  public getById(orderId: string): P2pOrder {
    const maybeOrder = p2pOrders.get(orderId);

    if (!maybeOrder) {
      throw new P2POrderNotFoundException(orderId);
    }

    return maybeOrder;
  }

  public getBySellerId(sellerId: string): P2pOrder[] {
    return p2pOrders.values().filter((order) => order.sellerId === sellerId);
  }

  public getByBuyerId(buyerId: string): P2pOrder[] {
    return p2pOrders.values().filter((order) => order.buyerId === buyerId);
  }

  public async create(data: CreateOrderData) {
    const seller = this.userService.getById(data.sellerId);

    if (!seller) {
      throw new UserNotFoundException(
        `Seller with ID ${data.sellerId} not found`,
      );
    }

    const buyer = this.userService.getById(data.buyerId);

    if (!buyer) {
      throw new UserNotFoundException(
        `Buyer with ID ${data.buyerId} not found`,
      );
    }

    if (!this.tokenService.isTokenSupported(data.tokenId)) {
      throw new UnsupportedTokenException(data.tokenId, [data.tokenId]);
    }

    const sellerBalances = await this.walletService.getBalances(data.sellerId);
    const sellerBalance =
      sellerBalances.find((balance) => balance.tokenId === data.tokenId)
        ?.balance || 0;

    const blockedBalance = this.getBlockedBalance(data.sellerId, data.tokenId);
    const availableBalance = BigInt(sellerBalance) - blockedBalance;
    const requiredAmount = BigInt(data.amount);

    if (availableBalance < requiredAmount) {
      throw new InsufficientBalanceException(
        data.tokenId,
        availableBalance,
        requiredAmount,
      );
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

    return {
      ...newOrder,
      status: orderStatusToString(newOrder.status),
    };
  }

  public confirmOrder(data: ConfirmOrderData) {
    return this.updateOrderStatus(data.orderId, OrderStatus.PENDING_PAYMENT);
  }

  public markAsPaid(data: MarkAsPaidData) {
    return this.updateOrderStatus(data.orderId, OrderStatus.PAYMENT_MARKED);
  }

  public confirmPayment(data: ConfirmPaymentData) {
    const order = this.getById(data.orderId);

    if (!this.tokenService.isTokenSupported(order.tokenId)) {
      throw new UnsupportedTokenException(order.tokenId, [order.tokenId]);
    }

    this.walletService.transferToUser({
      from: order.sellerId,
      to: order.buyerId,
      token: order.tokenId,
      amount: Number(order.amount),
    });

    return this.updateOrderStatus(data.orderId, OrderStatus.COMPLETED);
  }

  public cancelOrder(orderId: string, reason: string) {
    if (!reason) {
      throw new P2POrderValidationException(
        'reason',
        '',
        'Cancellation reason is required',
      );
    }

    const order = this.getById(orderId);
    this.validateStatusTransition(order.status, OrderStatus.CANCELLED);

    const updatedOrder: P2pOrder = {
      ...order,
      status: OrderStatus.CANCELLED,
      cancellationReason: reason,
      updatedAt: BigInt(Date.now()),
    };

    p2pOrders.insert(orderId, updatedOrder);

    return {
      ...updatedOrder,
      status: orderStatusToString(updatedOrder.status),
    };
  }
}
