import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('companies/:companyId/metrics')
  getMetrics(
    @Param('companyId') companyId: string,
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
  ) {
    return this.dashboard.getCompanyMetrics(companyId, days);
  }

  @Get('companies/:companyId/burnout-risk')
  getBurnoutRisk(@Param('companyId') companyId: string) {
    return this.dashboard.getBurnoutRisk(companyId);
  }
}
