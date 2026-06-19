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

  async sendMessage(
    userId: string | null,
    phone: string,
    content: string,
  ): Promise<void> {
    const accountSid = this.config.get<string>('whatsapp.accountSid');
    const authToken = this.config.get<string>('whatsapp.authToken');
    const from = this.config.get<string>('whatsapp.from');

    let status: 'sent' | 'failed' = 'failed';
    let providerResponse: string | null = null;

    if (!accountSid || !authToken || !from) {
      this.logger.warn(
        'Twilio credentials not configured. Running in dry-run mode.',
      );
      this.logger.log(`=== [DRY RUN] To: +${phone}\n${content}\n===`);
      status = 'sent';
      providerResponse = 'dry-run';
    } else {
      try {
        const client = twilio(accountSid, authToken);
        const message = await client.messages.create({
          from: `whatsapp:${from}`,
          to: `whatsapp:+${phone}`,
          body: content,
        });
        status = 'sent';
        providerResponse = message.sid;
        this.logger.log(`WhatsApp sent to +${phone} — SID: ${message.sid}`);
      } catch (error) {
        providerResponse = (error as Error).message;
        this.logger.error(`Twilio error for +${phone}: ${providerResponse}`);
      }
    }

    if (userId) {
      await this.prisma.messageLog.create({
        data: {
          userId,
          direction: 'outbound',
          content,
          status,
          providerResponse,
        },
      });
    }
  }
}
