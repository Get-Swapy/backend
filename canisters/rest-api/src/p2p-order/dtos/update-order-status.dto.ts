import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum OrderStatusEnum {
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAYMENT_MARKED = 'PAYMENT_MARKED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatusEnum)
  public status: OrderStatusEnum;

  @IsString()
  @IsOptional()
  public reason?: string;
}
