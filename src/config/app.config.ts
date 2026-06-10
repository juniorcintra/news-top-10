import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  cronSchedule: process.env.CRON_SCHEDULE ?? '0 7 * * *',
}));
