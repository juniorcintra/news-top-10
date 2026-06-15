import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { UsersModule } from '../users/users.module';
import { CheckinModule } from '../checkin/checkin.module';

@Module({
  imports: [UsersModule, CheckinModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
