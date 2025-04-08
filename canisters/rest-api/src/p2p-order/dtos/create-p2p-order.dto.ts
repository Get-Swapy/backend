import {
  IsEnum,
  IsNumber,
  IsPositive,
  IsString,
  Validate,
} from 'class-validator';

import { SupportedTokens } from '../../wallet/constants/tokens.constants';
import { SUPPORTED_FIAT_CURRENCIES } from '../constants/order.constants';

export class DifferentUserValidator {
  validate(value: any, args: any) {
    return args.object.sellerId !== args.object.buyerId;
  }

  defaultMessage() {
    return 'Buyer and seller must be different users';
  }
}

export class CreateP2pOrderDto {
  @IsString()
  sellerId: string;

  @IsString()
  buyerId: string;

  @Validate(DifferentUserValidator)
  @IsEnum(SupportedTokens)
  tokenId: SupportedTokens;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(SUPPORTED_FIAT_CURRENCIES)
  fiatCurrency: string;

  @IsNumber()
  @IsPositive()
  fiatAmount: number;
}
