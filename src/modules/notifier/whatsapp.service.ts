import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async send(summaryId: string, content: string): Promise<void> {
    const accountSid = this.config.get<string>('whatsapp.accountSid');
    const authToken = this.config.get<string>('whatsapp.authToken');
    const from = this.config.get<string>('whatsapp.from');
    const recipient =
      this.config.get<string>('whatsapp.recipient') ?? 'unknown';

    if (!accountSid || !authToken || !from || recipient === 'unknown') {
      this.logger.warn(
        'Twilio credentials not configured. Running in dry-run mode.',
      );
      this.logger.log('=== [DRY RUN] WhatsApp message preview ===');
      console.log('\n' + content + '\n');
      this.logger.log('=== [DRY RUN] End of message ===');

      await this.prisma.notificationLog.create({
        data: {
          summaryId,
          recipient,
          status: 'sent',
          providerResponse: 'dry-run',
        },
      });
      return;
    }

    let status: 'sent' | 'failed' = 'failed';
    let providerResponse: string | null = null;

    try {
      const client = twilio(accountSid, authToken);

      const message = await client.messages.create({
        from: `whatsapp:${from}`,
        to: `whatsapp:+${recipient}`,
        body: content,
      });

      status = 'sent';
      providerResponse = message.sid;
      this.logger.log(`WhatsApp sent to +${recipient} — SID: ${message.sid}`);
    } catch (error) {
      providerResponse = (error as Error).message;
      this.logger.error(`Twilio error: ${providerResponse}`);
    }

    await this.prisma.notificationLog.create({
      data: { summaryId, recipient, status, providerResponse },
    });
  }
}
