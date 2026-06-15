import { Module } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { CheckinScheduler } from './checkin.scheduler';
import { UsersModule } from '../users/users.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [UsersModule, WhatsappModule, AiModule],
  providers: [CheckinService, CheckinScheduler],
  exports: [CheckinService],
})
export class CheckinModule {}
