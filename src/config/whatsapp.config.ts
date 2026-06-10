import { registerAs } from '@nestjs/config';

export default registerAs('whatsapp', () => ({
  apiKey: process.env.WHATSAPP_API_KEY,
  instanceId: process.env.WHATSAPP_INSTANCE_ID,
  recipient: process.env.WHATSAPP_RECIPIENT,
}));
