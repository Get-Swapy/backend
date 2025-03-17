import { Injectable } from '@nestjs/common';
import { StableBTreeMap, text } from 'azle/experimental';

import { NetworkService } from '../network/network.service';
import { Token } from './entities/token.entity';

const tokens = StableBTreeMap<text, Token>(2);

type RegisterTokenData = {
  name: string;
  symbol: string;
  networks: string[];
};

@Injectable()
export class TokenService {
  constructor(private readonly networkService: NetworkService) {}

  public getAll(): Token[] {
    return tokens.values();
  }

  public register(data: RegisterTokenData) {
    const maybeToken = tokens.get(data.symbol);

    if (maybeToken) throw new Error('This token already exists');

    const networks = this.networkService.getAll();
    const availableNetworks = new Set(networks.map((n) => n.name));

    const hasInvalidNetwork = data.networks.some(
      (network) => !availableNetworks.has(network),
    );

    if (hasInvalidNetwork) {
      throw new Error('Invalid network detected in token data.');
    }

    return tokens.insert(data.symbol, data);
  }

  public remove(symbol: string) {
    return tokens.remove(symbol);
  }
}
