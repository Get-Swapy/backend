// import { Injectable } from '@nestjs/common';
import { IDL, call } from 'azle';
import {
  CallArgs,
  FeeHistory,
  FeeHistoryArgs,
  GetTransactionCountArgs,
  MultiCallResult,
  MultiFeeHistoryResult,
  MultiGetTransactionCountResult,
  MultiSendRawTransactionResult,
  RequestResult,
  RpcConfig,
  RpcService,
  RpcServices,
} from 'azle/canisters/evm_rpc/idl';
import { Account } from 'azle/canisters/icrc_1/idl';
import {
  ThresholdKeyInfo,
  calculateRsvForTEcdsa,
  ecdsaPublicKey,
  signWithEcdsa,
} from 'azle/experimental';
import { Transaction, ethers, getUint } from 'ethers';

export type CallPayload = {
  to: string;
  from?: string;
  input?: string;
  value?: bigint;
};

export type TransactionPayload = {
  to: string;
  from?: string;
  data?: string;
  value?: bigint;
};

export type SignRequest = {
  to: string;
  gasLimit: bigint;
  chainId?: bigint;
  from?: string;
  data?: string;
  value?: bigint;
  nonce?: number;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
};

// @Injectable()
export class EvmRpcService {
  // TODO: Set this dynamically
  private readonly canisterId = '7hfb6-caaaa-aaaar-qadga-cai';

  constructor(private readonly service: RpcServices) {}

  public async accountToAddress(account: Account): Promise<string> {
    const thresholdKeyInfo = this.getThresholdKeyInfo(account);

    const pubkey = await ecdsaPublicKey(thresholdKeyInfo);

    const evmAddress = ethers.computeAddress(ethers.hexlify(pubkey));

    return evmAddress;
  }

  public async call(payload: CallPayload) {
    if (!payload.to) {
      throw new Error('Destination address is required');
    }

    const args: CallArgs = {
      transaction: {
        to: [payload.to],
        from: payload.from ? [payload.from] : [],
        input: [payload.input],
        value: payload.value ? [payload.value] : [],
        chainId: [],
        maxPriorityFeePerGas: [],
        maxFeePerGas: [],
        nonce: [],
        gas: [],
        gasPrice: [],
        maxFeePerBlobGas: [],
        type: [],
        accessList: [],
        blobs: [],
        blobVersionedHashes: [],
      },
      block: [],
    };

    const result: MultiCallResult = await call(this.canisterId, 'eth_call', {
      paramIdlTypes: [RpcServices, IDL.Opt(RpcConfig), CallArgs],
      returnIdlType: MultiCallResult,
      args: [this.service, [], args],
      cycles: 2_000_000_000n,
    });

    if ('Consistent' in result && 'Ok' in result.Consistent) {
      return result.Consistent.Ok;
    }
  }

  public async sendTransaction(payload: TransactionPayload, account: Account) {
    if (!payload.to) {
      throw new Error('Destination address is required');
    }

    const chainId = this.getChainId();
    const requestService = this.getRequestService();
    const maxPriorityFeePerGas =
      await this.maxPriorityFeePerGas(requestService);
    const feeHistory = await this.getFeeHistory();
    const baseFeePerGas = feeHistory.baseFeePerGas[0];
    const maxFeePerGas = baseFeePerGas * 2n + maxPriorityFeePerGas;
    const gasLimit = getUint(100000);
    const nonce = await this.getTransactionCount(
      await this.accountToAddress(account),
    );

    const transaction: SignRequest = {
      to: payload.to,
      from: payload.from,
      data: payload.data,
      value: payload.value,
      chainId,
      maxPriorityFeePerGas,
      maxFeePerGas,
      gasLimit,
      nonce: Number(nonce),
    };

    const thresholdKeyInfo = this.getThresholdKeyInfo(account);
    const signedTransaction = await this.signTransaction(
      transaction,
      thresholdKeyInfo,
    );

    const result: MultiSendRawTransactionResult = await call(
      this.canisterId,
      'eth_sendRawTransaction',
      {
        paramIdlTypes: [RpcServices, IDL.Opt(RpcConfig), IDL.Text],
        returnIdlType: MultiSendRawTransactionResult,
        args: [this.service, [], signedTransaction],
        cycles: 2_000_000_000n,
      },
    );

    // Check for successful response and extract the transaction hash
    if (
      'Consistent' in result &&
      'Ok' in result.Consistent &&
      'Ok' in result.Consistent.Ok
    ) {
      return result.Consistent.Ok.Ok;
    }

    // Mejorar el manejo de errores
    if (
      'Consistent' in result &&
      'Ok' in result.Consistent &&
      'Err' in result.Consistent.Ok
    ) {
      throw new Error(
        `Transaction error: ${JSON.stringify(result.Consistent.Ok.Err)}`,
      );
    } else if ('Consistent' in result && 'Err' in result.Consistent) {
      throw new Error(`RPC error: ${JSON.stringify(result.Consistent.Err)}`);
    } else if ('Inconsistent' in result) {
      throw new Error(
        `Inconsistent result: ${JSON.stringify(result.Inconsistent)}`,
      );
    }

    throw new Error(
      `Error sending transaction: Unexpected response format: ${JSON.stringify(result)}`,
    );
  }

  private getChainId(): bigint {
    if ('Custom' in this.service) return this.service.Custom.chainId;
    if ('EthSepolia' in this.service) return BigInt(11155111);
    if ('EthMainnet' in this.service) return BigInt(1);
    if ('ArbitrumOne' in this.service) return BigInt(42161);
    if ('BaseMainnet' in this.service) return BigInt(8453);
    if ('OptimismMainnet' in this.service) return BigInt(10);

    throw new Error('ChainId not found');
  }

  private getRequestService(): RpcService {
    const { service } = this;

    if ('Custom' in service) {
      return {
        Custom: {
          url: service.Custom.services[0].url,
          headers: service.Custom.services[0].headers,
        },
      };
    }

    if ('EthSepolia' in service && 'Some' in service.EthSepolia) {
      return { EthSepolia: service.EthSepolia.Some[0] };
    }

    if ('EthMainnet' in service && 'Some' in service.EthMainnet) {
      return { EthMainnet: service.EthMainnet.Some[0] };
    }

    if ('ArbitrumOne' in service && 'Some' in service.ArbitrumOne) {
      return { ArbitrumOne: service.ArbitrumOne.Some[0] };
    }

    if ('BaseMainnet' in service && 'Some' in service.BaseMainnet) {
      return { BaseMainnet: service.BaseMainnet.Some[0] };
    }

    if ('OptimismMainnet' in service && 'Some' in service.OptimismMainnet) {
      return { OptimismMainnet: service.OptimismMainnet.Some[0] };
    }

    throw new Error('Service not found');
  }

  private getThresholdKeyInfo(account: Account): ThresholdKeyInfo {
    const derivationPath: Uint8Array[] = [];

    if (account.subaccount && account.subaccount.length > 0) {
      const subaccount = account.subaccount[0];

      if (subaccount instanceof Uint8Array) {
        derivationPath.push(subaccount);
      } else if (Array.isArray(subaccount)) {
        derivationPath.push(new Uint8Array(subaccount));
      }
    }

    return {
      derivationPath,
      canisterId: account.owner,
      // TODO: Set this dynamically
      keyId: {
        curve: 'secp256k1',
        name: 'dfx_test_key',
      },
    };
  }

  // Métodos privados después, ordenados por dependencia
  private async maxPriorityFeePerGas(service: RpcService): Promise<bigint> {
    const body = {
      jsonrpc: '2.0',
      method: 'eth_maxPriorityFeePerGas',
      params: [],
      id: 1,
    };

    const result: RequestResult = await call(this.canisterId, 'request', {
      paramIdlTypes: [RpcService, IDL.Text, IDL.Nat64],
      returnIdlType: RequestResult,
      args: [service, JSON.stringify(body), 1_000n],
      cycles: 2_000_000_000n,
    });

    if ('Err' in result) {
      const error = result.Err;

      if ('JsonRpcError' in error) {
        throw new Error(
          `JSON-RPC Error: ${error.JsonRpcError.message} (code: ${error.JsonRpcError.code})`,
        );
      } else if ('ProviderError' in error) {
        if ('TooFewCycles' in error.ProviderError) {
          const { expected, received } = error.ProviderError.TooFewCycles;
          throw new Error(
            `Provider Error: Insufficient cycles. Expected: ${expected}, Received: ${received}`,
          );
        } else if ('InvalidRpcConfig' in error.ProviderError) {
          throw new Error(
            `Provider Error: Invalid RPC configuration - ${error.ProviderError.InvalidRpcConfig}`,
          );
        } else if ('MissingRequiredProvider' in error.ProviderError) {
          throw new Error('Provider Error: Missing required provider');
        } else if ('ProviderNotFound' in error.ProviderError) {
          throw new Error('Provider Error: Provider not found');
        } else if ('NoPermission' in error.ProviderError) {
          throw new Error(
            'Provider Error: No permission to access the provider',
          );
        }
      } else if ('ValidationError' in error) {
        if ('Custom' in error.ValidationError) {
          throw new Error(`Validation Error: ${error.ValidationError.Custom}`);
        } else if ('InvalidHex' in error.ValidationError) {
          throw new Error(
            `Validation Error: Invalid hex value - ${error.ValidationError.InvalidHex}`,
          );
        }
      } else if ('HttpOutcallError' in error) {
        if ('IcError' in error.HttpOutcallError) {
          throw new Error(
            `HTTP Outcall Error: ${error.HttpOutcallError.IcError.message}`,
          );
        } else if ('InvalidHttpJsonRpcResponse' in error.HttpOutcallError) {
          const { status, body, parsingError } =
            error.HttpOutcallError.InvalidHttpJsonRpcResponse;
          const errorMsg =
            parsingError && parsingError.length > 0
              ? parsingError[0]
              : 'Unknown parsing error';
          throw new Error(
            `Invalid HTTP JSON-RPC Response: Status ${status}, Error: ${errorMsg}, Body: ${body}`,
          );
        }
      }

      // Fallback for any unhandled error types
      throw new Error(
        `Error getting max priority fee: ${JSON.stringify(error)}`,
      );
    }

    const maxPriorityFeePerGas = BigInt(JSON.parse(result.Ok).result);
    return maxPriorityFeePerGas;
  }

  private async getFeeHistory(): Promise<FeeHistory> {
    const jsonRpcArgs: FeeHistoryArgs = {
      blockCount: 1n,
      newestBlock: {
        Latest: null,
      },
      rewardPercentiles: [],
    };

    const result: MultiFeeHistoryResult = await call(
      this.canisterId,
      'eth_feeHistory',
      {
        paramIdlTypes: [RpcServices, IDL.Opt(RpcConfig), FeeHistoryArgs],
        returnIdlType: MultiFeeHistoryResult,
        args: [this.service, [], jsonRpcArgs],
        cycles: 2_000_000_000n,
      },
    );

    if ('Consistent' in result && 'Ok' in result.Consistent) {
      return result.Consistent.Ok;
    }

    throw new Error('Error getting fee history: Unknown response format');
  }

  private async getTransactionCount(address: string): Promise<bigint> {
    const jsonRpcArgs: GetTransactionCountArgs = {
      address,
      block: {
        Latest: null,
      },
    };

    const result: MultiGetTransactionCountResult = await call(
      this.canisterId,
      'eth_getTransactionCount',
      {
        paramIdlTypes: [
          RpcServices,
          IDL.Opt(RpcConfig),
          GetTransactionCountArgs,
        ],
        returnIdlType: MultiGetTransactionCountResult,
        args: [this.service, [], jsonRpcArgs],
        cycles: 2_000_000_000n,
      },
    );

    if ('Consistent' in result && 'Ok' in result.Consistent) {
      return result.Consistent.Ok;
    }

    throw new Error('Error getting transaction count');
  }

  private async signTransaction(
    transaction: SignRequest,
    thresholdKeyInfo: ThresholdKeyInfo,
  ): Promise<string> {
    const tx = Transaction.from({
      to: transaction.to,
      chainId: transaction.chainId,
      from: transaction.from,
      gasLimit: transaction.gasLimit,
      maxFeePerGas: transaction.maxFeePerGas,
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
      data: transaction.data,
      value: transaction.value,
      nonce: transaction.nonce,
      type: 2,
    });

    const unsignedSerializedTx = tx.unsignedSerialized;
    const unsignedSerializedTxHash = ethers.keccak256(unsignedSerializedTx);

    const signedSerializedTxHash = await signWithEcdsa(
      thresholdKeyInfo,
      ethers.getBytes(unsignedSerializedTxHash),
    );

    const pubkey = await ecdsaPublicKey(thresholdKeyInfo);
    const evmAddress = ethers.computeAddress(ethers.hexlify(pubkey));

    const { r, s, v } = calculateRsvForTEcdsa(
      Number(transaction.chainId),
      evmAddress,
      unsignedSerializedTxHash,
      signedSerializedTxHash,
    );

    tx.signature = {
      r,
      s,
      v,
    };

    return tx.serialized;
  }
}
