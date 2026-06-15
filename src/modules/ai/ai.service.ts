import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { CheckInOption } from '../checkin/checkin.constants';

const SYSTEM_PROMPT = `Você é Calmai, assistente virtual de bem-estar para empreendedores e colaboradores.
Regras estritas:
1. Máximo de 30 palavras por resposta.
2. Tom acolhedor, prático, direto e sem julgamentos.
3. Nunca cite dados de outros usuários.
4. Sempre responda em português brasileiro.
5. Use emojis com moderação.`;

const STATIC_POSITIVE: Record<string, string> = {
  humor:
    'Que ótimo começo de semana! Energia alta é o combustível certo. Vá em frente! ⚡',
  nutricao:
    'Corpo bem nutrido, mente afiada. Continue cuidando de você assim! 🥗',
  fitness: 'Movimento é saúde! Seu corpo agradece cada esforço. Continue! 💪',
  mental: 'Mente tranquila, decisões melhores. Você está no caminho certo! 🟢',
  sono: 'Sono de qualidade é o melhor investimento no seu desempenho. Parabéns! 😴',
};

const STATIC_NEUTRAL: Record<string, string> = {
  humor:
    'Dia neutro faz parte. Pequenas pausas ajudam a recarregar. Cuide-se! 🧘',
  nutricao:
    'Equilíbrio é tudo. Hoje é uma nova chance de nutrir melhor o seu corpo! ⚖️',
  fitness: 'Até uma caminhada curta já faz diferença. Continue tentando! 🚶',
  mental:
    'Pressão passageira. Uma coisa de cada vez, sem cobranças excessivas. 🟡',
  sono: 'Poucas horas hoje? Tente dormir 30 min mais cedo amanhã. Vale a pena! ⏱️',
};

const STATIC_CRITICAL: Record<string, string> = {
  humor:
    'Entendi. Quando a ansiedade bate, tente: inspire 4s, segure 4s, expire 4s. Repita 3x. Estou aqui. 💙',
  nutricao:
    "Comer por ansiedade é um sinal do corpo pedindo atenção. Beba um copo d'água agora e respira. 💧",
  fitness:
    'Sem energia para se mover é um sinal importante. Uma pausa consciente já é cuidado. 🛋️',
  mental:
    'Quando a mente trava, o corpo trava junto. Levanta, estica o corpo por 2 minutos. Um passo só. 🔴',
  sono: 'Insônia frequente pesa muito. Tente desligar telas 30 min antes de dormir. Seu descanso importa. 🦉',
};

const STATIC_BURNOUT_ALERT =
  'Percebi que esta semana está sendo muito pesada para você. ' +
  'O programa de saúde da sua empresa oferece suporte confidencial. ' +
  'Quer que eu te envie o contato? Você não precisa carregar isso sozinho. 💙';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI | null = null;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('openai.apiKey');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.logger.warn(
        'OPENAI_API_KEY not set — running in static-response mode (no token cost).',
      );
    }
    this.model = this.config.get<string>('openai.model') ?? 'gpt-4o-mini';
  }

  async generateCheckinResponse(
    userName: string | null,
    pillar: string,
    option: CheckInOption,
    consecutiveCriticalDays: number,
    supportLink?: string,
  ): Promise<string> {
    if (!this.openai) {
      return this.staticResponse(pillar, option, consecutiveCriticalDays);
    }

    const name = userName ?? 'você';
    let userMessage: string;

    if (consecutiveCriticalDays >= 3 && option.isCritical) {
      userMessage =
        `${name} respondeu ao check-in de ${pillar} com "${option.emoji} ${option.label}" (score ${option.score}/5).\n` +
        `Esta é a ${consecutiveCriticalDays}ª vez consecutiva com resposta crítica.\n` +
        `Gere mensagem empática sugerindo suporte confidencial da empresa${supportLink ? ` (link: ${supportLink})` : ''}.`;
    } else if (option.isCritical) {
      userMessage =
        `${name} respondeu ao check-in de ${pillar} com "${option.emoji} ${option.label}" (score ${option.score}/5).\n` +
        `Resposta crítica. Gere mensagem empática com sugestão prática imediata (respiração, pausa).`;
    } else {
      userMessage =
        `${name} respondeu ao check-in de ${pillar} com "${option.emoji} ${option.label}" (score ${option.score}/5).\n` +
        `Resposta positiva/neutra. Gere frase curta de incentivo (máx 15 palavras).`;
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      return (
        completion.choices[0]?.message?.content?.trim() ??
        this.staticResponse(pillar, option, consecutiveCriticalDays)
      );
    } catch (error) {
      this.logger.error(`OpenAI error: ${(error as Error).message}`);
      return this.staticResponse(pillar, option, consecutiveCriticalDays);
    }
  }

  private staticResponse(
    pillar: string,
    option: CheckInOption,
    consecutiveCriticalDays: number,
  ): string {
    if (consecutiveCriticalDays >= 3 && option.isCritical) {
      return STATIC_BURNOUT_ALERT;
    }
    if (option.isCritical) {
      return (
        STATIC_CRITICAL[pillar] ??
        'Respira. Um passo de cada vez. Estou aqui com você. 💙'
      );
    }
    if (option.score >= 4) {
      return STATIC_POSITIVE[pillar] ?? 'Incrível! Continue assim! 🌟';
    }
    return (
      STATIC_NEUTRAL[pillar] ??
      'Obrigado por compartilhar. Amanhã é uma nova chance! 💪'
    );
  }
}
