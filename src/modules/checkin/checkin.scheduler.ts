import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { CheckinService } from './checkin.service';

@Injectable()
export class CheckinScheduler implements OnModuleInit {
  private readonly logger = new Logger(CheckinScheduler.name);

  constructor(
    private readonly config: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly checkin: CheckinService,
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

    this.schedulerRegistry.addCronJob('calmai-morning', morningJob);
    this.schedulerRegistry.addCronJob('calmai-evening', eveningJob);
    morningJob.start();
    eveningJob.start();

    this.logger.log(`Morning check-in cron: [${morningCron}]`);
    this.logger.log(`Evening check-in cron:  [${eveningCron}]`);
  }
}
