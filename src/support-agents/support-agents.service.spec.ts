import { Test, TestingModule } from '@nestjs/testing';
import { SupportAgentsService } from './support-agents.service';

describe('SupportAgentsService', () => {
  let service: SupportAgentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupportAgentsService],
    }).compile();

    service = module.get<SupportAgentsService>(SupportAgentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
