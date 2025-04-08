import { Injectable } from '@nestjs/common';
import { Account } from 'azle/canisters/icrc_1/idl';

import { Token, TokenInfo } from './token.interface';
import { ICP } from './tokens/icp';
import { USDC_ARBITRUM } from './tokens/usdc_arbitrum';

@Injectable()
export class TokenService {
  private readonly tokens: Map<string, TokenInfo>;

  constructor() {
    this.tokens = new Map<string, TokenInfo>();

    // Registrar tokens disponibles
    this.registerToken({
      id: 'ICP',
      name: 'Internet Computer Protocol',
      symbol: 'ICP',
      network: 'Internet Computer',
      instance: ICP,
    });

    this.registerToken({
      id: 'USDC_ARBITRUM',
      name: 'USD Coin',
      symbol: 'USDC',
      network: 'Arbitrum One',
      instance: USDC_ARBITRUM,
    });
  }

  /**
   * Registra un nuevo token en el sistema
   * @param tokenInfo Información del token a registrar
   */
  private registerToken(tokenInfo: TokenInfo): void {
    this.tokens.set(tokenInfo.id, tokenInfo);
  }

  /**
   * Obtiene todos los tokens disponibles
   * @returns Lista de información de tokens
   */
  public getAllTokens(): TokenInfo[] {
    return Array.from(this.tokens.values());
  }

  /**
   * Verifica si un token es soportado
   * @param tokenId Identificador del token
   * @returns true si el token es soportado, false en caso contrario
   */
  public isTokenSupported(tokenId: string): boolean {
    return this.tokens.has(tokenId);
  }

  /**
   * Obtiene la implementación de un token específico
   * @param tokenId Identificador del token
   * @returns Instancia del token
   * @throws Error si el token no es soportado
   */
  public getToken(tokenId: string): Token {
    const tokenInfo = this.tokens.get(tokenId);
    if (!tokenInfo) {
      throw new Error(`Token ${tokenId} no soportado`);
    }
    return tokenInfo.instance;
  }

  /**
   * Obtiene información de un token específico
   * @param tokenId Identificador del token
   * @returns Información del token
   * @throws Error si el token no es soportado
   */
  public getTokenInfo(tokenId: string): TokenInfo {
    const tokenInfo = this.tokens.get(tokenId);
    if (!tokenInfo) {
      throw new Error(`Token ${tokenId} no soportado`);
    }
    return tokenInfo;
  }

  /**
   * Transfiere tokens de una cuenta a otra
   * @param tokenId Identificador del token
   * @param from Cuenta origen
   * @param to Cuenta destino
   * @param amount Cantidad a transferir
   * @returns Resultado de la transferencia
   */
  public transferToken(
    tokenId: string,
    from: Account,
    to: Account,
    amount: number,
  ) {
    const token = this.getToken(tokenId);
    return token.transfer(from, to, amount);
  }
}
