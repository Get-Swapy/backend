import { IsEnum, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateP2pOrderDto {
  @IsString()
  public sellerId: string;

  @IsString()
  public buyerId: string;

  @IsEnum(['ICP', 'USDC_ARBITRUM'])
  public tokenId: string;

  @IsNumber()
  @IsPositive()
  public amount: number;

  @IsNumber()
  @IsPositive()
  public fiatAmount: number;

  @IsString()
  public fiatCurrency: string;
}
