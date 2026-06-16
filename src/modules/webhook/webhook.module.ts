import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { UsersModule } from '../users/users.module';
import { CheckinModule } from '../checkin/checkin.module';
import { AiModule } from '../ai/ai.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [UsersModule, CheckinModule, AiModule, WhatsappModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
