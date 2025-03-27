import { IsEnum, IsNumber, IsString } from 'class-validator';

export class TransferToUserDto {
  @IsString()
  userId: string;

  @IsNumber()
  amount: number;

  @IsEnum(['ICP', 'USDC_ARBITRUM'])
  token: string;
}
