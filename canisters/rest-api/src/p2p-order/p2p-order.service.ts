import { Injectable } from '@nestjs/common';
import { StableBTreeMap } from 'azle';
import { text } from 'azle/experimental';
import { v4 as uuidv4 } from 'uuid';

import { UserService } from '../user/user.service';
import { SupportedTokens } from '../wallet/constants/tokens.constants';
import { TokenService } from '../wallet/token.service';
import { WalletService } from '../wallet/wallet.service';
import {
  OrderStatusVariant,
  P2pOrder,
  orderStatusToString,
} from './entities/p2p-order.entity';
import {
  InsufficientBalanceException,
  InvalidOrderStatusTransitionException,
  P2POrderNotFoundException,
  P2POrderValidationException,
  UnsupportedTokenException,
} from './exceptions/p2p-order.exceptions';
import { UserNotFoundException } from '../user/exceptions/user.exception';

const p2pOrders = new StableBTreeMap<text, P2pOrder>(1);

const validStatusTransitions = new Map([
  ['WAITING_FOR_BUYER_CONFIRMATION', ['WAITING_FOR_PAYMENT', 'CANCELLED']],
  ['WAITING_FOR_PAYMENT', ['WAITING_FOR_PAYMENT_CONFIRMATION', 'CANCELLED']],
  ['WAITING_FOR_PAYMENT_CONFIRMATION', ['COMPLETED', 'CANCELLED']],
  ['CANCELLED', []],
  ['COMPLETED', []],
]);

type CreateOrderData = {
  sellerId: string;
  buyerId: string;
  tokenId: SupportedTokens;
  amount: number;
  fiatAmount: number;
  fiatCurrency: string;
};

@Injectable()
export class P2pOrderService {
  constructor(
    private readonly userService: UserService,
    private readonly walletService: WalletService,
    private readonly tokenService: TokenService,
  ) {}

  private validateStatusTransition(
    currentStatus: OrderStatusVariant,
    newStatus: OrderStatusVariant,
  ): void {
    const currentStatusStr = orderStatusToString(currentStatus);
    const newStatusStr = orderStatusToString(newStatus);
    const allowedTransitions = validStatusTransitions.get(currentStatusStr);

    if (!allowedTransitions) {
      throw new InvalidOrderStatusTransitionException(
        currentStatusStr,
        newStatusStr,
        Array.from(validStatusTransitions.keys()),
      );
    }

    if (!allowedTransitions.includes(newStatusStr)) {
      throw new InvalidOrderStatusTransitionException(
        currentStatusStr,
        newStatusStr,
        allowedTransitions,
      );
    }
  }

  private stringToOrderStatus(status: string): OrderStatusVariant {
    switch (status) {
      case 'WAITING_FOR_BUYER_CONFIRMATION':
        return { WAITING_FOR_BUYER_CONFIRMATION: null };
      case 'WAITING_FOR_PAYMENT':
        return { WAITING_FOR_PAYMENT: null };
      case 'WAITING_FOR_PAYMENT_CONFIRMATION':
        return { WAITING_FOR_PAYMENT_CONFIRMATION: null };
      case 'COMPLETED':
        return { COMPLETED: null };
      case 'CANCELLED':
        return { CANCELLED: null };
      default:
        throw new P2POrderValidationException(
          'status',
          status,
          'Invalid order status',
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
    newStatus: OrderStatusVariant,
  ): P2pOrder {
    const order = this.getById(orderId);

    this.validateStatusTransition(order.status, newStatus);

    const updatedOrder: P2pOrder = {
      ...order,
      status: newStatus,
      updatedAt: BigInt(Date.now()),
    };

    p2pOrders.insert(updatedOrder.id, updatedOrder);

    return updatedOrder;
  }

  public getAll(): P2pOrder[] {
    return p2pOrders.values();
  }

  public getById(orderId: string) {
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

    // TODO: Validate if seller and buyer are different users

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
      status: { WAITING_FOR_BUYER_CONFIRMATION: null },
      cancellationReason: '',
      createdAt: now,
      updatedAt: now,
    };

    p2pOrders.insert(orderId, newOrder);

    const response = {
      ...newOrder,
      amount: Number(newOrder.amount),
      fiatAmount: Number(newOrder.fiatAmount),
      createdAt: Number(newOrder.createdAt),
      updatedAt: Number(newOrder.updatedAt),
      status: orderStatusToString(newOrder.status),
    };

    return response;
  }

  public acceptOrder(orderId: string): P2pOrder {
    return this.updateOrderStatus(orderId, { WAITING_FOR_PAYMENT: null });
  }

  public markAsPaid(orderId: string) {
    this.updateOrderStatus(orderId, { WAITING_FOR_PAYMENT_CONFIRMATION: null });
  }

  public async confirmPayment(orderId: string) {
    const order = this.getById(orderId);

    const transferResult = await this.walletService.transferToUser({
      from: order.sellerId,
      to: order.buyerId,
      token: order.tokenId,
      amount: Number(order.amount),
    });

    const updatedOrder = this.updateOrderStatus(orderId, { COMPLETED: null });
    return { ...transferResult, order: updatedOrder };
  }

  public cancelOrder(orderId: string, reason: string): P2pOrder {
    const order = this.getById(orderId);

    this.validateStatusTransition(order.status, { CANCELLED: null });

    const updatedOrder: P2pOrder = {
      ...order,
      status: { CANCELLED: null },
      cancellationReason: reason,
      updatedAt: BigInt(Date.now()),
    };

    p2pOrders.insert(updatedOrder.id, updatedOrder);

    return updatedOrder;
  }
}
