import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IvrModule } from './ivr/ivr.module';
import { SupportAgentsModule } from './support-agents/support-agents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    IvrModule,
    SupportAgentsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
