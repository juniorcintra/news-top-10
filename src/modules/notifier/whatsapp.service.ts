import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async send(summaryId: string, content: string): Promise<void> {
    const instanceId = this.config.get<string>('whatsapp.instanceId');
    const apiKey = this.config.get<string>('whatsapp.apiKey');
    const recipient = this.config.get<string>('whatsapp.recipient');

    if (!instanceId || !apiKey || !recipient) {
      this.logger.warn(
        'WhatsApp credentials not configured. Skipping notification.',
      );
      return;
    }

    const url = `https://api.green-api.com/waInstance${instanceId}/sendMessage/${apiKey}`;
    const chatId = `${recipient}@c.us`;

    let status: 'sent' | 'failed' = 'failed';
    let providerResponse: string | null = null;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message: content }),
      });

      const data = (await response.json()) as Record<string, unknown>;
      providerResponse = JSON.stringify(data);

      if (response.ok) {
        status = 'sent';
        this.logger.log(`WhatsApp message sent to ${recipient}`);
      } else {
        this.logger.error(`Green API error: ${providerResponse}`);
      }
    } catch (error) {
      providerResponse = (error as Error).message;
      this.logger.error(`Failed to send WhatsApp message: ${providerResponse}`);
    }

    await this.prisma.notificationLog.create({
      data: {
        summaryId,
        recipient,
        status,
        providerResponse,
      },
    });
  }
}
