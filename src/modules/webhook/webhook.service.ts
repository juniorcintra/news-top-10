import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CheckinService } from '../checkin/checkin.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly checkin: CheckinService,
  ) {}

  async handleIncoming(from: string, body: string): Promise<void> {
    const phone = this.normalizePhone(from);

    if (!phone) {
      this.logger.warn(`Invalid phone number received: "${from}"`);
      return;
    }

    this.logger.log(`Processing message from +${phone}: "${body}"`);

    const user = await this.users.findOrCreate(phone);

    await this.prisma.messageLog.create({
      data: {
        userId: user.id,
        direction: 'inbound',
        content: body,
        status: 'sent',
      },
    });

    await this.checkin.processResponse(
      {
        id: user.id,
        name: user.name ?? null,
        whatsappPhone: user.whatsappPhone,
      },
      body,
    );
  }

  private normalizePhone(from: string): string {
    return from.replace('whatsapp:', '').replace('+', '').trim();
  }
}
