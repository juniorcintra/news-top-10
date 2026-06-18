import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { UsersService } from '../users/users.service';
import {
  getCheckInForDay,
  getEveningCheckInForDay,
  parseResponse,
} from './checkin.constants';
import {
  ConvState,
  getCriticalFollowUp2,
  getFollowUp,
} from './checkin.followup';

export interface UserContext {
  id: string;
  name: string | null;
  whatsappPhone: string;
  conversationState?: string | null;
}

@Injectable()
export class CheckinService {
  private readonly logger = new Logger(CheckinService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly whatsapp: WhatsappService,
    private readonly ai: AiService,
  ) {}

  async dispatchMorningCheckin(): Promise<void> {
    const raw = new Date().getDay();
    const dayOfWeek = raw === 0 || raw === 6 ? 1 : raw;
    const checkIn = getCheckInForDay(dayOfWeek);

    if (!checkIn) {
      this.logger.log(`No check-in found for day ${dayOfWeek}.`);
      return;
    }

    const activeUsers = await this.users.findAllActive();
    this.logger.log(
      `Dispatching morning check-in [${checkIn.pillar}] to ${activeUsers.length} user(s).`,
    );

    for (const user of activeUsers) {
      const message = checkIn.message.replace('{nome}', user.name ?? 'você');
      await this.whatsapp.sendMessage(user.id, user.whatsappPhone, message);
    }

    const newUsers = await this.users.findAllPendingOnboarding();
    for (const user of newUsers) {
      await this.users.updateName(user.id, 'PENDING');
      await this.whatsapp.sendMessage(
        user.id,
        user.whatsappPhone,
        'Olá! Eu sou a Calmai 💙\n\nEstou aqui para acompanhar o seu bem-estar diariamente, com check-ins rápidos de manhã (08:30) e à noite (20:30).\n\nQual é o seu nome?',
      );
    }
  }

  async dispatchMorningCheckinToUser(user: UserContext): Promise<void> {
    const raw = new Date().getDay();
    const dayOfWeek = raw === 0 || raw === 6 ? 1 : raw;
    const checkIn = getCheckInForDay(dayOfWeek);
    if (!checkIn) return;
    const message = checkIn.message.replace('{nome}', user.name ?? 'você');
    await this.whatsapp.sendMessage(user.id, user.whatsappPhone, message);
  }

  async dispatchEveningCheckinToUser(user: UserContext): Promise<void> {
    const raw = new Date().getDay();
    const dayOfWeek = raw === 0 || raw === 6 ? 5 : raw;
    const checkIn = getEveningCheckInForDay(dayOfWeek);
    if (!checkIn) return;
    const message = checkIn.message.replace('{nome}', user.name ?? 'você');
    await this.whatsapp.sendMessage(user.id, user.whatsappPhone, message);
  }

  async dispatchEveningCheckin(): Promise<void> {
    const raw = new Date().getDay();
    const dayOfWeek = raw === 0 || raw === 6 ? 5 : raw;
    const checkIn = getEveningCheckInForDay(dayOfWeek);

    if (!checkIn) {
      this.logger.log(`No evening check-in found for day ${dayOfWeek}.`);
      return;
    }

    const activeUsers = await this.users.findAllActive();
    this.logger.log(
      `Dispatching evening check-in [${checkIn.pillar}] to ${activeUsers.length} user(s).`,
    );

    for (const user of activeUsers) {
      const message = checkIn.message.replace('{nome}', user.name ?? 'você');
      await this.whatsapp.sendMessage(user.id, user.whatsappPhone, message);
    }
  }

  async processResponse(user: UserContext, body: string): Promise<void> {
    const dayOfWeek = new Date().getDay();
    const checkIn = getCheckInForDay(dayOfWeek);

    if (!checkIn) {
      await this.whatsapp.sendMessage(
        user.id,
        user.whatsappPhone,
        'Hoje não temos check-in agendado. Até os próximos dias! 😊',
      );
      return;
    }

    const option = parseResponse(body, checkIn.options);

    if (!option) {
      const list = checkIn.options
        .map((o) => `${o.number}️⃣ ${o.emoji} ${o.label}`)
        .join('\n');
      await this.whatsapp.sendMessage(
        user.id,
        user.whatsappPhone,
        `Por favor, responda com o número da opção:\n\n${list}`,
      );
      return;
    }

    const consecutiveCritical = await this.countConsecutiveCriticalDays(
      user.id,
    );
    const criticalCount = option.isCritical ? consecutiveCritical + 1 : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.checkIn.upsert({
      where: { userId_date: { userId: user.id, date: today } },
      update: {
        buttonResponse: `${option.number} - ${option.emoji} ${option.label}`,
        scoreConverted: option.score,
        isCritical: option.isCritical,
      },
      create: {
        userId: user.id,
        date: today,
        pillar: checkIn.pillar,
        buttonResponse: `${option.number} - ${option.emoji} ${option.label}`,
        scoreConverted: option.score,
        isCritical: option.isCritical,
      },
    });

    const followUp = getFollowUp(checkIn.pillar, option.number);

    if (followUp) {
      await this.whatsapp.sendMessage(
        user.id,
        user.whatsappPhone,
        `💡 *Micro-hábito:* ${followUp.microHabit}`,
      );
      await this.whatsapp.sendMessage(
        user.id,
        user.whatsappPhone,
        followUp.question,
      );
      const state: ConvState = {
        step: 'followup_1',
        pillar: checkIn.pillar,
        initialOptionNumber: option.number,
        initialLabel: option.label,
        isCritical: option.isCritical,
        consecutiveCritical: criticalCount,
      };
      await this.users.setConversationState(user.id, state);
    } else {
      const aiResponse = await this.ai.generateCheckinResponse(
        user.name,
        checkIn.pillar,
        option,
        criticalCount,
      );
      await this.whatsapp.sendMessage(user.id, user.whatsappPhone, aiResponse);
    }

    this.logger.log(
      `Check-in saved: user=${user.whatsappPhone} pillar=${checkIn.pillar} score=${option.score}`,
    );
  }

  async processFollowUp(user: UserContext, body: string): Promise<void> {
    if (!user.conversationState) return;

    let state: ConvState;
    try {
      state = JSON.parse(user.conversationState) as ConvState;
    } catch {
      await this.users.clearConversationState(user.id);
      return;
    }

    const optionNumber = parseInt(body.trim(), 10);

    if (state.step === 'followup_2') {
      const criticalQ = getCriticalFollowUp2(state.pillar);
      const followUp2Label =
        criticalQ.options.find((o) => o.number === optionNumber)?.label ??
        body.trim();

      const aiResponse = await this.ai.generateFollowUpResponse(
        user.name,
        state.pillar,
        state.initialLabel,
        state.followUp1Label ?? '',
        followUp2Label,
        state.isCritical,
        state.consecutiveCritical,
      );

      await this.whatsapp.sendMessage(user.id, user.whatsappPhone, aiResponse);
      await this.users.clearConversationState(user.id);

      this.logger.log(
        `Critical follow-up 2 processed: user=${user.whatsappPhone} pillar=${state.pillar}`,
      );
      return;
    }

    const followUp = getFollowUp(state.pillar, state.initialOptionNumber);
    const followUp1Label =
      followUp?.options.find((o) => o.number === optionNumber)?.label ??
      body.trim();

    if (state.isCritical) {
      const criticalQ = getCriticalFollowUp2(state.pillar);
      await this.whatsapp.sendMessage(
        user.id,
        user.whatsappPhone,
        criticalQ.question,
      );
      await this.users.setConversationState(user.id, {
        ...state,
        step: 'followup_2',
        followUp1Label,
      });
      this.logger.log(
        `Critical follow-up 2 queued: user=${user.whatsappPhone} pillar=${state.pillar}`,
      );
      return;
    }

    const aiResponse = await this.ai.generateFollowUpResponse(
      user.name,
      state.pillar,
      state.initialLabel,
      followUp?.question ?? '',
      followUp1Label,
      state.isCritical,
      state.consecutiveCritical,
    );

    await this.whatsapp.sendMessage(user.id, user.whatsappPhone, aiResponse);
    await this.users.clearConversationState(user.id);

    this.logger.log(
      `Follow-up processed: user=${user.whatsappPhone} pillar=${state.pillar} followUp=${followUp1Label}`,
    );
  }

  async processEveningResponse(user: UserContext, body: string): Promise<void> {
    const raw = new Date().getDay();
    const dayOfWeek = raw === 0 || raw === 6 ? 5 : raw;
    const checkIn = getEveningCheckInForDay(dayOfWeek);

    if (!checkIn) {
      await this.whatsapp.sendMessage(
        user.id,
        user.whatsappPhone,
        'Obrigado pela mensagem! Por hoje já está tudo certo. 😊',
      );
      return;
    }

    const option = parseResponse(body, checkIn.options);

    if (!option) {
      const list = checkIn.options
        .map((o) => `${o.number}️⃣ ${o.emoji} ${o.label}`)
        .join('\n');
      await this.whatsapp.sendMessage(
        user.id,
        user.whatsappPhone,
        `Por favor, responda com o número da opção:\n\n${list}`,
      );
      return;
    }

    const consecutiveCritical = await this.countConsecutiveCriticalDays(
      user.id,
    );
    const criticalCount = option.isCritical ? consecutiveCritical + 1 : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.checkIn.upsert({
      where: { userId_date: { userId: user.id, date: today } },
      update: {
        buttonResponse: `${option.number} - ${option.emoji} ${option.label}`,
        scoreConverted: option.score,
        isCritical: option.isCritical,
      },
      create: {
        userId: user.id,
        date: today,
        pillar: checkIn.pillar,
        buttonResponse: `${option.number} - ${option.emoji} ${option.label}`,
        scoreConverted: option.score,
        isCritical: option.isCritical,
      },
    });

    const followUp = getFollowUp(checkIn.pillar, option.number);

    if (followUp) {
      await this.whatsapp.sendMessage(
        user.id,
        user.whatsappPhone,
        `💡 *Micro-hábito:* ${followUp.microHabit}`,
      );
      await this.whatsapp.sendMessage(
        user.id,
        user.whatsappPhone,
        followUp.question,
      );
      const state: ConvState = {
        step: 'followup_1',
        pillar: checkIn.pillar,
        initialOptionNumber: option.number,
        initialLabel: option.label,
        isCritical: option.isCritical,
        consecutiveCritical: criticalCount,
      };
      await this.users.setConversationState(user.id, state);
    } else {
      const aiResponse = await this.ai.generateCheckinResponse(
        user.name,
        checkIn.pillar,
        option,
        criticalCount,
      );
      await this.whatsapp.sendMessage(user.id, user.whatsappPhone, aiResponse);
    }

    this.logger.log(
      `Evening check-in saved: user=${user.whatsappPhone} pillar=${checkIn.pillar} score=${option.score}`,
    );
  }

  private async countConsecutiveCriticalDays(userId: string): Promise<number> {
    const recent = await this.prisma.checkIn.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 7,
    });

    let count = 0;
    for (const ci of recent) {
      if (ci.isCritical) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }
}
