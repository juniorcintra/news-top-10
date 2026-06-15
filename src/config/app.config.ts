import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  morningCron: process.env.MORNING_CRON ?? '30 8 * * 1-5',
  eveningCron: process.env.EVENING_CRON ?? '30 20 * * 1-5',
}));
