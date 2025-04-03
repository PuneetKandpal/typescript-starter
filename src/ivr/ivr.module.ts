import { Module } from '@nestjs/common';
import { IvrController } from './ivr.controller';
import { IvrService } from './ivr.service';
import { SupportAgentsService } from '../support-agents/support-agents.service';

@Module({
  controllers: [IvrController],
  providers: [IvrService, SupportAgentsService]
})
export class IvrModule {}
