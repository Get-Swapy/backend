import { Account } from 'azle/canisters/icrc_1/idl';

export type TransferResult = {
  transactionId: string;
  explorerUrl: string;
};

export interface Token {
  /**
   * Obtiene la dirección de la cuenta para el token
   * @param account La cuenta del usuario
   */
  address(account: Account): Promise<string>;

  /**
   * Obtiene los decimales del token
   */
  decimals(): Promise<number>;

  /**
   * Obtiene el balance de tokens para una cuenta
   * @param account La cuenta del usuario
   */
  balance(account: Account): Promise<bigint>;

  /**
   * Transfiere tokens de una cuenta a otra
   * @param from Cuenta origen
   * @param to Cuenta destino
   * @param amount Cantidad a transferir
   */
  transfer(from: Account, to: Account, amount: number): Promise<TransferResult>;
}

export interface TokenInfo {
  /** Identificador único del token */
  id: string;
  /** Nombre del token */
  name: string;
  /** Símbolo del token */
  symbol: string;
  /** Red en la que opera el token */
  network: string;
  /** Instancia del token que implementa la interfaz Token */
  instance: Token;
}
