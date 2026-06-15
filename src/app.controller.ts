import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { CheckinService } from './modules/checkin/checkin.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly checkinService: CheckinService,
  ) {}

  @Get('health')
  getHealth(): object {
    return this.appService.getStatus();
  }

  @Post('health/dispatch')
  @HttpCode(HttpStatus.OK)
  triggerDispatch(): object {
    void this.checkinService.dispatchMorningCheckin();
    return { triggered: true };
  }
}
