export type HealthPillar = 'humor' | 'nutricao' | 'fitness' | 'mental' | 'sono';

export interface CheckInOption {
  number: number;
  emoji: string;
  label: string;
  score: number;
  isCritical: boolean;
}

export interface DailyCheckIn {
  dayOfWeek: number;
  pillar: HealthPillar;
  message: string;
  options: CheckInOption[];
}

export const DAILY_CHECK_INS: DailyCheckIn[] = [
  {
    dayOfWeek: 1,
    pillar: 'humor',
    message:
      'Bom dia, {nome}! ☀️ Como está seu nível de energia e foco para começar a semana?\n\n' +
      '1️⃣ ⚡ 100% Pronto\n' +
      '2️⃣ 🪵 Cansado\n' +
      '3️⃣ 🌀 Ansioso\n' +
      '4️⃣ 🧘 Neutro\n\n' +
      '_Responda com o número da opção._',
    options: [
      {
        number: 1,
        emoji: '⚡',
        label: '100% Pronto',
        score: 5,
        isCritical: false,
      },
      { number: 2, emoji: '🪵', label: 'Cansado', score: 2, isCritical: false },
      {
        number: 3,
        emoji: '🌀',
        label: 'Ansioso',
        score: 1,
        isCritical: true,
      },
      { number: 4, emoji: '🧘', label: 'Neutro', score: 3, isCritical: false },
    ],
  },
  {
    dayOfWeek: 2,
    pillar: 'nutricao',
    message:
      'Olá, {nome}! 💧 Como foi a sua relação com a alimentação e hidratação ontem?\n\n' +
      '1️⃣ 🥗 Super Saudável\n' +
      '2️⃣ 🍕 Comi por Ansiedade\n' +
      '3️⃣ 🧊 Esqueci de Beber Água\n' +
      '4️⃣ ⚖️ Equilibrado\n\n' +
      '_Responda com o número da opção._',
    options: [
      {
        number: 1,
        emoji: '🥗',
        label: 'Super Saudável',
        score: 5,
        isCritical: false,
      },
      {
        number: 2,
        emoji: '🍕',
        label: 'Comi por Ansiedade',
        score: 1,
        isCritical: true,
      },
      {
        number: 3,
        emoji: '🧊',
        label: 'Esqueci de Beber Água',
        score: 2,
        isCritical: false,
      },
      {
        number: 4,
        emoji: '⚖️',
        label: 'Equilibrado',
        score: 4,
        isCritical: false,
      },
    ],
  },
  {
    dayOfWeek: 3,
    pillar: 'fitness',
    message:
      'Metade da semana! 🏃‍♂️ Você conseguiu colocar o corpo em movimento nos últimos dias?\n\n' +
      '1️⃣ 💪 Treinei Forte\n' +
      '2️⃣ 🚶 Só Caminhadas Curtas\n' +
      '3️⃣ 🛋️ Sedentário\n' +
      '4️⃣ 🚫 Sem Tempo/Lesão\n\n' +
      '_Responda com o número da opção._',
    options: [
      {
        number: 1,
        emoji: '💪',
        label: 'Treinei Forte',
        score: 5,
        isCritical: false,
      },
      {
        number: 2,
        emoji: '🚶',
        label: 'Caminhadas Curtas',
        score: 3,
        isCritical: false,
      },
      {
        number: 3,
        emoji: '🛋️',
        label: 'Sedentário',
        score: 2,
        isCritical: false,
      },
      {
        number: 4,
        emoji: '🚫',
        label: 'Sem Tempo/Lesão',
        score: 2,
        isCritical: false,
      },
    ],
  },
  {
    dayOfWeek: 4,
    pillar: 'mental',
    message:
      'Oi, {nome}. Como está a sua mente hoje com a carga de trabalho? 🧠\n\n' +
      '1️⃣ 🟢 Sob Controle\n' +
      '2️⃣ 🟡 Sob Pressão\n' +
      '3️⃣ 🔴 No Limite/Burnout\n' +
      '4️⃣ 🔵 Calmo/Produtivo\n\n' +
      '_Responda com o número da opção._',
    options: [
      {
        number: 1,
        emoji: '🟢',
        label: 'Sob Controle',
        score: 4,
        isCritical: false,
      },
      {
        number: 2,
        emoji: '🟡',
        label: 'Sob Pressão',
        score: 2,
        isCritical: false,
      },
      {
        number: 3,
        emoji: '🔴',
        label: 'No Limite/Burnout',
        score: 1,
        isCritical: true,
      },
      {
        number: 4,
        emoji: '🔵',
        label: 'Calmo/Produtivo',
        score: 5,
        isCritical: false,
      },
    ],
  },
  {
    dayOfWeek: 5,
    pillar: 'sono',
    message:
      'Sextou! 🛌 Avaliando as suas noites de sono desta semana, como você se sente?\n\n' +
      '1️⃣ 😴 Dormi Super Bem\n' +
      '2️⃣ 🦉 Insônia/Acordei Cansado\n' +
      '3️⃣ ⏱️ Dormi Poucas Horas\n\n' +
      '_Responda com o número da opção._',
    options: [
      {
        number: 1,
        emoji: '😴',
        label: 'Dormi Super Bem',
        score: 5,
        isCritical: false,
      },
      {
        number: 2,
        emoji: '🦉',
        label: 'Insônia/Acordei Cansado',
        score: 1,
        isCritical: true,
      },
      {
        number: 3,
        emoji: '⏱️',
        label: 'Dormi Poucas Horas',
        score: 2,
        isCritical: false,
      },
    ],
  },
];

export const EVENING_CHECK_INS: DailyCheckIn[] = [
  {
    dayOfWeek: 1,
    pillar: 'humor',
    message:
      'Boa noite, {nome}! 🌙 Como encerrou o dia de hoje em termos de humor e energia?\n\n' +
      '1️⃣ 😊 Melhor que o esperado\n' +
      '2️⃣ 😐 Igual ao início do dia\n' +
      '3️⃣ 😔 Acabou mais cansado\n' +
      '4️⃣ 😤 Frustrado/Irritado\n\n' +
      '_Responda com o número da opção._',
    options: [
      {
        number: 1,
        emoji: '😊',
        label: 'Melhor que o esperado',
        score: 5,
        isCritical: false,
      },
      {
        number: 2,
        emoji: '😐',
        label: 'Igual ao início do dia',
        score: 3,
        isCritical: false,
      },
      {
        number: 3,
        emoji: '😔',
        label: 'Acabou mais cansado',
        score: 2,
        isCritical: false,
      },
      {
        number: 4,
        emoji: '😤',
        label: 'Frustrado/Irritado',
        score: 1,
        isCritical: true,
      },
    ],
  },
  {
    dayOfWeek: 2,
    pillar: 'nutricao',
    message:
      'Boa noite, {nome}! 🥦 Como foi a sua alimentação e hidratação hoje?\n\n' +
      '1️⃣ 💚 Comi bem e me hidratei\n' +
      '2️⃣ ⚖️ Razoável, poderia melhorar\n' +
      '3️⃣ 🍟 Comi mal e esqueci a água\n' +
      '4️⃣ 😰 Pulei refeições por estresse\n\n' +
      '_Responda com o número da opção._',
    options: [
      {
        number: 1,
        emoji: '💚',
        label: 'Comi bem e me hidratei',
        score: 5,
        isCritical: false,
      },
      {
        number: 2,
        emoji: '⚖️',
        label: 'Razoável, poderia melhorar',
        score: 3,
        isCritical: false,
      },
      {
        number: 3,
        emoji: '🍟',
        label: 'Comi mal e esqueci a água',
        score: 2,
        isCritical: false,
      },
      {
        number: 4,
        emoji: '😰',
        label: 'Pulei refeições por estresse',
        score: 1,
        isCritical: true,
      },
    ],
  },
  {
    dayOfWeek: 3,
    pillar: 'fitness',
    message:
      'Boa noite, {nome}! 🌃 Você conseguiu se movimentar hoje?\n\n' +
      '1️⃣ 🏋️ Sim, treinei\n' +
      '2️⃣ 🚶 Uma caminhada curta\n' +
      '3️⃣ 🛋️ Fiquei parado o dia todo\n' +
      '4️⃣ 🤕 Não consegui por dor/cansaço extremo\n\n' +
      '_Responda com o número da opção._',
    options: [
      {
        number: 1,
        emoji: '🏋️',
        label: 'Sim, treinei',
        score: 5,
        isCritical: false,
      },
      {
        number: 2,
        emoji: '🚶',
        label: 'Uma caminhada curta',
        score: 3,
        isCritical: false,
      },
      {
        number: 3,
        emoji: '🛋️',
        label: 'Fiquei parado o dia todo',
        score: 2,
        isCritical: false,
      },
      {
        number: 4,
        emoji: '🤕',
        label: 'Não consegui por dor/cansaço extremo',
        score: 1,
        isCritical: true,
      },
    ],
  },
  {
    dayOfWeek: 4,
    pillar: 'mental',
    message:
      'Boa noite, {nome}. 🧘 Ao final do dia, como está sua mente?\n\n' +
      '1️⃣ 🔵 Tranquilo e satisfeito\n' +
      '2️⃣ 🟡 Um pouco sobrecarregado\n' +
      '3️⃣ 🔴 Exausto/Sem conseguir desligar\n' +
      '4️⃣ 😶 Entorpecido/Sem sentir nada\n\n' +
      '_Responda com o número da opção._',
    options: [
      {
        number: 1,
        emoji: '🔵',
        label: 'Tranquilo e satisfeito',
        score: 5,
        isCritical: false,
      },
      {
        number: 2,
        emoji: '🟡',
        label: 'Um pouco sobrecarregado',
        score: 2,
        isCritical: false,
      },
      {
        number: 3,
        emoji: '🔴',
        label: 'Exausto/Sem conseguir desligar',
        score: 1,
        isCritical: true,
      },
      {
        number: 4,
        emoji: '😶',
        label: 'Entorpecido/Sem sentir nada',
        score: 1,
        isCritical: true,
      },
    ],
  },
  {
    dayOfWeek: 5,
    pillar: 'sono',
    message:
      'Boa noite, {nome}! 🌛 Antes de dormir: qual é a sua expectativa para essa noite?\n\n' +
      '1️⃣ 😴 Estou com sono, vou dormir bem\n' +
      '2️⃣ 💭 Mente agitada, pode ser difícil\n' +
      '3️⃣ 😟 Tenho ansiedade sobre amanhã\n' +
      '4️⃣ 🥱 Exausto mas sei que vou acordar cansado\n\n' +
      '_Responda com o número da opção._',
    options: [
      {
        number: 1,
        emoji: '😴',
        label: 'Estou com sono, vou dormir bem',
        score: 5,
        isCritical: false,
      },
      {
        number: 2,
        emoji: '💭',
        label: 'Mente agitada, pode ser difícil',
        score: 2,
        isCritical: false,
      },
      {
        number: 3,
        emoji: '😟',
        label: 'Tenho ansiedade sobre amanhã',
        score: 1,
        isCritical: true,
      },
      {
        number: 4,
        emoji: '🥱',
        label: 'Exausto mas sei que vou acordar cansado',
        score: 2,
        isCritical: false,
      },
    ],
  },
];

export function getCheckInForDay(dayOfWeek: number): DailyCheckIn | null {
  return DAILY_CHECK_INS.find((c) => c.dayOfWeek === dayOfWeek) ?? null;
}

export function getEveningCheckInForDay(
  dayOfWeek: number,
): DailyCheckIn | null {
  return EVENING_CHECK_INS.find((c) => c.dayOfWeek === dayOfWeek) ?? null;
}

export function parseResponse(
  input: string,
  options: CheckInOption[],
): CheckInOption | null {
  const trimmed = input.trim();

  const num = parseInt(trimmed, 10);
  if (!isNaN(num)) {
    return options.find((o) => o.number === num) ?? null;
  }

  const lower = trimmed.toLowerCase();
  return (
    options.find(
      (o) =>
        o.label.toLowerCase().includes(lower) ||
        lower.includes(o.label.toLowerCase()),
    ) ?? null
  );
}
