import { IsEnum, IsNumber, IsString } from 'class-validator';

export class TransferToUserDto {
  @IsString()
  from: string;

  @IsString()
  to: string;

  @IsNumber()
  amount: number;

  @IsEnum(['ICP', 'USDC_ARBITRUM'])
  token: string;
}
