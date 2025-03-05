import { Injectable } from '@nestjs/common';
import { StableBTreeMap, text } from 'azle/experimental';

import { Network } from './entities/network.entity';

const networks = StableBTreeMap<text, Network>(1);

type RegisterNetworkData = {
  name: string;
};

@Injectable()
export class NetworkService {
  public getAll(): Network[] {
    return networks.values();
  }

  public register(data: RegisterNetworkData) {
    // TODO: validations and define its ID
    return networks.insert(data.name, data);
  }

  public remove(networkId: string) {
    return networks.remove(networkId);
  }
}
