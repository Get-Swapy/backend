import { Controller, Get, NotFoundException, Param } from '@nestjs/common';

import { TokenService } from './token.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly tokenService: TokenService) {}

  /**
   * Obtiene todos los tokens disponibles
   * @returns Lista de tokens soportados con su información
   */
  @Get('tokens')
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
   * Verifica si un token específico es soportado
   * @param tokenId Identificador del token
   * @returns Información del token si es soportado
   */
  @Get('tokens/:tokenId')
  public getToken(@Param('tokenId') tokenId: string) {
    if (!this.tokenService.isTokenSupported(tokenId)) {
      throw new NotFoundException(`Token ${tokenId} no soportado`);
    }

    const tokenInfo = this.tokenService.getTokenInfo(tokenId);
    return {
      id: tokenInfo.id,
      name: tokenInfo.name,
      symbol: tokenInfo.symbol,
      network: tokenInfo.network,
    };
  }
}
