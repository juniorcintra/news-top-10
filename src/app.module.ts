import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import appConfig from './config/app.config';
import whatsappConfig from './config/whatsapp.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, whatsappConfig],
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
