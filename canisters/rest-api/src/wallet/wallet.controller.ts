import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';

import { TransferToUserDto } from './dtos/transfer-to-user.dto';
import { TokenService } from './token.service';
import { WalletService } from './wallet.service';

@Controller('/wallet')
export class WalletController {
  constructor(
    private readonly wallet: WalletService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Gets all available tokens
   * @returns List of supported tokens with their information
   */
  @Get('/tokens')
  public getAllTokens() {
    const tokens = this.tokenService.getAllTokens();

    return tokens.map((token) => ({
      id: token.id,
      name: token.name,
      symbol: token.symbol,
      network: token.network,
    }));
  }

  /**
   * Checks if a specific token is supported
   * @param tokenId Identifier of the token
   * @returns Information of the token if it is supported
   */
  @Get('/tokens/:tokenId')
  public getToken(@Param('tokenId') tokenId: string) {
    if (!this.tokenService.isTokenSupported(tokenId)) {
      throw new NotFoundException(`Token ${tokenId} is not supported`);
    }

    const tokenInfo = this.tokenService.getTokenInfo(tokenId);

    return {
      id: tokenInfo.id,
      name: tokenInfo.name,
      symbol: tokenInfo.symbol,
      network: tokenInfo.network,
    };
  }

  @Post('/transfer')
  public async transferToUser(@Body() data: TransferToUserDto) {
    return await this.wallet.transferToUser({
      from: data.from,
      to: data.to,
      token: data.token,
      amount: data.amount,
    });
  }
}
