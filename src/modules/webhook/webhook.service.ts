import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AiService } from '../ai/ai.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { CheckinService } from '../checkin/checkin.service';
import {
  DAILY_CHECK_INS,
  EVENING_CHECK_INS,
  parseResponse,
} from '../checkin/checkin.constants';

const BUTTON_PATTERN = /^\s*[1-4]\s*$/;

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly checkin: CheckinService,
    private readonly ai: AiService,
    private readonly whatsapp: WhatsappService,
  ) {}

  async handleIncoming(from: string, body: string): Promise<void> {
    const phone = this.normalizePhone(from);

    if (!phone) {
      this.logger.warn(`Invalid phone number received: "${from}"`);
      return;
    }

    this.logger.log(`Processing message from +${phone}: "${body}"`);

    const user = await this.users.findOrCreate(phone);
    const userCtx = {
      id: user.id,
      name: user.name ?? null,
      whatsappPhone: user.whatsappPhone,
    };

    await this.prisma.messageLog.create({
      data: {
        userId: user.id,
        direction: 'inbound',
        content: body,
        status: 'sent',
      },
    });

    if (user.name === null) {
      await this.users.updateName(user.id, 'PENDING');
      await this.whatsapp.sendMessage(
        user.id,
        user.whatsappPhone,
        'Olá! Sou a Calmai 💙\n\nEstou aqui para acompanhar o seu bem-estar diariamente.\n\nPrimeiro, qual é o seu nome?',
      );
      return;
    }

    if (user.name === 'PENDING') {
      const nome = body.trim().split(' ')[0] ?? body.trim();
      await this.users.updateName(user.id, nome);
      await this.whatsapp.sendMessage(
        user.id,
        user.whatsappPhone,
        `Prazer, ${nome}! 😊 A partir de agora vou te enviar check-ins todas as manhãs (08:30) e noites (20:30) de seg a sex.\n\nCuide-se! 💙`,
      );
      return;
    }

    const isButtonReply = BUTTON_PATTERN.test(body);

    if (isButtonReply) {
      if (this.isEveningWindow()) {
        await this.checkin.processEveningResponse(userCtx, body);
      } else {
        await this.checkin.processResponse(userCtx, body);
      }
      return;
    }

    const looksLikeOption = this.matchesAnyOption(body);
    if (looksLikeOption) {
      if (this.isEveningWindow()) {
        await this.checkin.processEveningResponse(userCtx, body);
      } else {
        await this.checkin.processResponse(userCtx, body);
      }
      return;
    }

    const reply = await this.ai.handleFreeText(user.name ?? null, body);
    await this.whatsapp.sendMessage(user.id, user.whatsappPhone, reply);
  }

  private isEveningWindow(): boolean {
    const hour = new Date().getHours();
    return hour >= 17;
  }

  private matchesAnyOption(text: string): boolean {
    const all = [...DAILY_CHECK_INS, ...EVENING_CHECK_INS].flatMap(
      (c) => c.options,
    );
    return parseResponse(text, all) !== null;
  }

  private normalizePhone(from: string): string {
    return from.replace('whatsapp:', '').replace('+', '').trim();
  }
}
