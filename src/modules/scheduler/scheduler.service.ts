import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { CollectorService } from '../collector/collector.service';
import { RankingService } from '../ranking/ranking.service';
import { SummaryService } from '../summary/summary.service';
import { WhatsappService } from '../notifier/whatsapp.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly collector: CollectorService,
    private readonly ranking: RankingService,
    private readonly summary: SummaryService,
    private readonly whatsapp: WhatsappService,
  ) {}

  onModuleInit() {
    const cronExpression =
      this.config.get<string>('app.cronSchedule') ?? '0 7 * * *';

    const job = new CronJob(cronExpression, () => {
      void this.runPipeline();
    });

    this.schedulerRegistry.addCronJob('daily-news', job);
    job.start();

    this.logger.log(`Daily news pipeline scheduled: [${cronExpression}]`);
  }

  async runPipeline(): Promise<void> {
    this.logger.log('=== Starting daily news pipeline ===');

    try {
      const rawArticles = await this.collector.collectAll();

      if (rawArticles.length === 0) {
        this.logger.warn('No articles collected. Aborting pipeline.');
        return;
      }

      const top10 = this.ranking.rank(rawArticles);

      if (top10.length === 0) {
        this.logger.warn('No articles ranked. Aborting pipeline.');
        return;
      }

      const summary = await this.summary.generateAndSave(top10);

      await this.whatsapp.send(summary.id, summary.content);

      this.logger.log('=== Pipeline completed successfully ===');
    } catch (error) {
      this.logger.error(
        `Pipeline failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }
}
