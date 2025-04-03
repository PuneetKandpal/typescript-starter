import { Module } from '@nestjs/common';
import { SupportAgentsController } from './support-agents.controller';
import { SupportAgentsService } from './support-agents.service';

@Module({
  controllers: [SupportAgentsController],
  providers: [SupportAgentsService]
})
export class SupportAgentsModule {}
