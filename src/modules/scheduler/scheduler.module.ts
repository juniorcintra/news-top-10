import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { CollectorModule } from '../collector/collector.module';
import { RankingModule } from '../ranking/ranking.module';
import { SummaryModule } from '../summary/summary.module';
import { NotifierModule } from '../notifier/notifier.module';

@Module({
  imports: [CollectorModule, RankingModule, SummaryModule, NotifierModule],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
