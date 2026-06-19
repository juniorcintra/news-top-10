import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { CheckinService } from './checkin.service';

const KEEP_ALIVE_PHONE = '5524992088631';

@Injectable()
export class CheckinScheduler implements OnModuleInit {
  private readonly logger = new Logger(CheckinScheduler.name);

  constructor(
    private readonly config: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly checkin: CheckinService,
    private readonly whatsapp: WhatsappService,
  ) {}

  onModuleInit() {
    const morningCron =
      this.config.get<string>('app.morningCron') ?? '30 8 * * 1-5';
    const eveningCron =
      this.config.get<string>('app.eveningCron') ?? '30 20 * * 1-5';

    const morningJob = new CronJob(morningCron, () => {
      void this.checkin.dispatchMorningCheckin();
    });

    const eveningJob = new CronJob(eveningCron, () => {
      void this.checkin.dispatchEveningCheckin();
    });

    const keepAliveJob = new CronJob('0 */3 * * *', () => {
      void this.whatsapp.sendMessage(null, KEEP_ALIVE_PHONE, 'Estou online!');
    });

    this.schedulerRegistry.addCronJob('calmai-morning', morningJob);
    this.schedulerRegistry.addCronJob('calmai-evening', eveningJob);
    this.schedulerRegistry.addCronJob('calmai-keepalive', keepAliveJob);
    morningJob.start();
    eveningJob.start();
    keepAliveJob.start();

    this.logger.log(`Morning check-in cron: [${morningCron}]`);
    this.logger.log(`Evening check-in cron:  [${eveningCron}]`);
    this.logger.log(`Keep-alive cron:        [0 */3 * * *]`);
  }
}
