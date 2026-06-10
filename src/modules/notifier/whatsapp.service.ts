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

    const chunks = this.splitMessage(content);

    if (!accountSid || !authToken || !from || recipient === 'unknown') {
      this.logger.warn(
        'Twilio credentials not configured. Running in dry-run mode.',
      );
      this.logger.log('=== [DRY RUN] WhatsApp message preview ===');
      chunks.forEach((chunk, i) =>
        console.log(`\n--- Part ${i + 1}/${chunks.length} ---\n${chunk}\n`),
      );
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
      const sids: string[] = [];

      for (const chunk of chunks) {
        const message = await client.messages.create({
          from: `whatsapp:${from}`,
          to: `whatsapp:+${recipient}`,
          body: chunk,
        });
        sids.push(message.sid);
      }

      status = 'sent';
      providerResponse = sids.join(',');
      this.logger.log(
        `WhatsApp sent to +${recipient} (${chunks.length} part(s)) — SIDs: ${providerResponse}`,
      );
    } catch (error) {
      providerResponse = (error as Error).message;
      this.logger.error(`Twilio error: ${providerResponse}`);
    }

    await this.prisma.notificationLog.create({
      data: { summaryId, recipient, status, providerResponse },
    });
  }

  private splitMessage(content: string, limit = 1500): string[] {
    if (content.length <= limit) return [content];

    const blocks = content.split('\n\n');
    const chunks: string[] = [];
    let current = '';

    for (const block of blocks) {
      const next = current ? `${current}\n\n${block}` : block;
      if (next.length > limit) {
        if (current) chunks.push(current.trim());
        current = block;
      } else {
        current = next;
      }
    }

    if (current) chunks.push(current.trim());
    return chunks;
  }
}
