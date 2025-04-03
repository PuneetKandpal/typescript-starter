import { Test, TestingModule } from '@nestjs/testing';
import { SupportAgentsController } from './support-agents.controller';

describe('SupportAgentsController', () => {
  let controller: SupportAgentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupportAgentsController],
    }).compile();

    controller = module.get<SupportAgentsController>(SupportAgentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
