import { Test, TestingModule } from '@nestjs/testing';

import { EvmRpcService } from './evm-rpc.service';

describe('EvmRpcService', () => {
  let service: EvmRpcService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvmRpcService],
    }).compile();

    service = module.get<EvmRpcService>(EvmRpcService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
