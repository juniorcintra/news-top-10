import { HealthPillar } from './checkin.constants';

export interface FollowUpOption {
  number: number;
  label: string;
}

export interface FollowUpStep {
  microHabit: string;
  question: string;
  options: FollowUpOption[];
}

export interface ConvState {
  step: 'followup_1';
  pillar: HealthPillar;
  initialOptionNumber: number;
  initialLabel: string;
  isCritical: boolean;
  consecutiveCritical: number;
}

export interface FollowUpTree {
  pillar: HealthPillar;
  byOption: Record<number, FollowUpStep>;
}

export const FOLLOW_UP_TREES: FollowUpTree[] = [
  {
    pillar: 'humor',
    byOption: {
      1: {
        microHabit:
          'Compartilhe essa energia! Mande uma mensagem positiva para alguém agora. 🌟',
        question:
          'O que mais contribuiu para esse ótimo humor hoje?\n\n1️⃣ Dormi bem\n2️⃣ Conquista recente\n3️⃣ Tempo com pessoas queridas\n4️⃣ Sem motivo específico',
        options: [
          { number: 1, label: 'Dormi bem' },
          { number: 2, label: 'Conquista recente' },
          { number: 3, label: 'Tempo com pessoas queridas' },
          { number: 4, label: 'Sem motivo específico' },
        ],
      },
      2: {
        microHabit:
          'Registre um momento bom do seu dia, por menor que seja. 📝',
        question:
          'O que tornaria seu dia ainda melhor?\n\n1️⃣ Mais produtividade\n2️⃣ Conexão com pessoas\n3️⃣ Tempo para mim\n4️⃣ Um intervalo',
        options: [
          { number: 1, label: 'Mais produtividade' },
          { number: 2, label: 'Conexão com pessoas' },
          { number: 3, label: 'Tempo para mim' },
          { number: 4, label: 'Um intervalo' },
        ],
      },
      3: {
        microHabit:
          'Faça 3 respirações profundas agora. Inspire 4s → segure 4s → expire 4s. 🌬️',
        question:
          'O que está pesando mais hoje?\n\n1️⃣ Trabalho e pressão\n2️⃣ Relacionamentos\n3️⃣ Cansaço acumulado\n4️⃣ Incerteza',
        options: [
          { number: 1, label: 'Trabalho e pressão' },
          { number: 2, label: 'Relacionamentos' },
          { number: 3, label: 'Cansaço acumulado' },
          { number: 4, label: 'Incerteza' },
        ],
      },
      4: {
        microHabit:
          'Pause tudo por 2 minutos. Você tem permissão de descansar. 💙',
        question:
          'Há quanto tempo você está se sentindo assim?\n\n1️⃣ Só hoje\n2️⃣ Alguns dias\n3️⃣ Semanas\n4️⃣ Meses',
        options: [
          { number: 1, label: 'Só hoje' },
          { number: 2, label: 'Alguns dias' },
          { number: 3, label: 'Semanas' },
          { number: 4, label: 'Meses' },
        ],
      },
    },
  },
  {
    pillar: 'nutricao',
    byOption: {
      1: {
        microHabit:
          'Continue assim! Anote mentalmente o que funcionou hoje na alimentação. ✅',
        question:
          'O que facilitou sua alimentação saudável?\n\n1️⃣ Planejamento prévio\n2️⃣ Cozinhei em casa\n3️⃣ Escolhas conscientes\n4️⃣ Rotina estabelecida',
        options: [
          { number: 1, label: 'Planejamento prévio' },
          { number: 2, label: 'Cozinhei em casa' },
          { number: 3, label: 'Escolhas conscientes' },
          { number: 4, label: 'Rotina estabelecida' },
        ],
      },
      2: {
        microHabit: "Tome um copo d'água agora. 💧",
        question:
          'Qual refeição poderia melhorar amanhã?\n\n1️⃣ Café da manhã\n2️⃣ Almoço\n3️⃣ Jantar\n4️⃣ Lanches',
        options: [
          { number: 1, label: 'Café da manhã' },
          { number: 2, label: 'Almoço' },
          { number: 3, label: 'Jantar' },
          { number: 4, label: 'Lanches' },
        ],
      },
      3: {
        microHabit: 'Na próxima refeição, adicione um vegetal ou fruta. 🥦',
        question:
          'O que dificultou sua alimentação hoje?\n\n1️⃣ Falta de tempo\n2️⃣ Estresse\n3️⃣ Sem opções saudáveis\n4️⃣ Falta de disposição',
        options: [
          { number: 1, label: 'Falta de tempo' },
          { number: 2, label: 'Estresse' },
          { number: 3, label: 'Sem opções saudáveis' },
          { number: 4, label: 'Falta de disposição' },
        ],
      },
      4: {
        microHabit:
          "Beba um copo d'água agora e coma algo, mesmo que pequeno. 🍌",
        question:
          'O que está impedindo você de se alimentar melhor?\n\n1️⃣ Sem apetite\n2️⃣ Sem tempo\n3️⃣ Falta de planejamento\n4️⃣ Fatores financeiros',
        options: [
          { number: 1, label: 'Sem apetite' },
          { number: 2, label: 'Sem tempo' },
          { number: 3, label: 'Falta de planejamento' },
          { number: 4, label: 'Fatores financeiros' },
        ],
      },
    },
  },
  {
    pillar: 'fitness',
    byOption: {
      1: {
        microHabit:
          'Alongue por 5 minutos antes de dormir para recuperação. 🧘',
        question:
          'Como foi a intensidade do treino?\n\n1️⃣ Leve e revigorante\n2️⃣ Moderada\n3️⃣ Intensa\n4️⃣ Máximo esforço',
        options: [
          { number: 1, label: 'Leve e revigorante' },
          { number: 2, label: 'Moderada' },
          { number: 3, label: 'Intensa' },
          { number: 4, label: 'Máximo esforço' },
        ],
      },
      2: {
        microHabit: 'Suba as escadas ao invés do elevador hoje. 🏃',
        question:
          'Que tipo de atividade você fez?\n\n1️⃣ Caminhada\n2️⃣ Exercício em casa\n3️⃣ Esporte\n4️⃣ Tarefas físicas',
        options: [
          { number: 1, label: 'Caminhada' },
          { number: 2, label: 'Exercício em casa' },
          { number: 3, label: 'Esporte' },
          { number: 4, label: 'Tarefas físicas' },
        ],
      },
      3: {
        microHabit: 'Levante e caminhe por 5 minutos agora. 🚶',
        question:
          'O que te impediu de se mover mais?\n\n1️⃣ Falta de tempo\n2️⃣ Cansaço\n3️⃣ Desmotivação\n4️⃣ Dor ou lesão',
        options: [
          { number: 1, label: 'Falta de tempo' },
          { number: 2, label: 'Cansaço' },
          { number: 3, label: 'Desmotivação' },
          { number: 4, label: 'Dor ou lesão' },
        ],
      },
      4: {
        microHabit: 'Faça 5 minutos de alongamento suave enquanto sentado. 💙',
        question:
          'Qual é o principal obstáculo para você se exercitar?\n\n1️⃣ Agenda muito cheia\n2️⃣ Dor ou lesão\n3️⃣ Sem energia\n4️⃣ Falta de estrutura',
        options: [
          { number: 1, label: 'Agenda muito cheia' },
          { number: 2, label: 'Dor ou lesão' },
          { number: 3, label: 'Sem energia' },
          { number: 4, label: 'Falta de estrutura' },
        ],
      },
    },
  },
  {
    pillar: 'mental',
    byOption: {
      1: {
        microHabit: 'Anote 3 coisas que você fez bem hoje. 📝',
        question:
          'O que mais contribuiu para seu equilíbrio mental esta semana?\n\n1️⃣ Descanso adequado\n2️⃣ Apoio de pessoas\n3️⃣ Conquistas no trabalho\n4️⃣ Hobbies e lazer',
        options: [
          { number: 1, label: 'Descanso adequado' },
          { number: 2, label: 'Apoio de pessoas' },
          { number: 3, label: 'Conquistas no trabalho' },
          { number: 4, label: 'Hobbies e lazer' },
        ],
      },
      2: {
        microHabit:
          'Tire 5 minutos longe das telas agora. Olhe pela janela. 🌿',
        question:
          'Qual área está gerando mais pressão?\n\n1️⃣ Prazos e entregas\n2️⃣ Relacionamentos\n3️⃣ Equilíbrio vida-trabalho\n4️⃣ Futuro incerto',
        options: [
          { number: 1, label: 'Prazos e entregas' },
          { number: 2, label: 'Relacionamentos' },
          { number: 3, label: 'Equilíbrio vida-trabalho' },
          { number: 4, label: 'Futuro incerto' },
        ],
      },
      3: {
        microHabit:
          'Escreva em papel o que está te preocupando. Só isso já ajuda. ✍️',
        question:
          'Com que frequência você sente essa ansiedade?\n\n1️⃣ Raramente\n2️⃣ Às vezes\n3️⃣ Frequentemente\n4️⃣ Quase todo dia',
        options: [
          { number: 1, label: 'Raramente' },
          { number: 2, label: 'Às vezes' },
          { number: 3, label: 'Frequentemente' },
          { number: 4, label: 'Quase todo dia' },
        ],
      },
      4: {
        microHabit:
          'Ligue para alguém de confiança hoje. Você não precisa enfrentar isso sozinho. 💙',
        question:
          'Você tem conseguido descansar?\n\n1️⃣ Sim, bem\n2️⃣ Pouco\n3️⃣ Muito pouco\n4️⃣ Quase nada',
        options: [
          { number: 1, label: 'Sim, bem' },
          { number: 2, label: 'Pouco' },
          { number: 3, label: 'Muito pouco' },
          { number: 4, label: 'Quase nada' },
        ],
      },
    },
  },
  {
    pillar: 'sono',
    byOption: {
      1: {
        microHabit:
          'Mantenha esse horário de dormir durante o fim de semana também! 😴',
        question:
          'O que ajudou no seu sono esta semana?\n\n1️⃣ Rotina noturna\n2️⃣ Menos telas\n3️⃣ Exercício regular\n4️⃣ Alimentação leve',
        options: [
          { number: 1, label: 'Rotina noturna' },
          { number: 2, label: 'Menos telas' },
          { number: 3, label: 'Exercício regular' },
          { number: 4, label: 'Alimentação leve' },
        ],
      },
      2: {
        microHabit: 'Hoje, evite telas 30 minutos antes de dormir. 📱',
        question:
          'O que mais atrapalha o seu sono?\n\n1️⃣ Pensamentos e ansiedade\n2️⃣ Horários irregulares\n3️⃣ Ambiente (barulho/luz)\n4️⃣ Estresse do dia',
        options: [
          { number: 1, label: 'Pensamentos e ansiedade' },
          { number: 2, label: 'Horários irregulares' },
          { number: 3, label: 'Ambiente' },
          { number: 4, label: 'Estresse do dia' },
        ],
      },
      3: {
        microHabit: 'Defina agora um horário fixo para dormir esta semana. 🕙',
        question:
          'Quantas horas você tem dormido por noite?\n\n1️⃣ Menos de 5h\n2️⃣ 5 a 6h\n3️⃣ 6 a 7h\n4️⃣ Mais de 7h mas mal descansado',
        options: [
          { number: 1, label: 'Menos de 5h' },
          { number: 2, label: '5 a 6h' },
          { number: 3, label: '6 a 7h' },
          { number: 4, label: 'Mais de 7h mal descansado' },
        ],
      },
      4: {
        microHabit: 'Evite cafeína após as 14h hoje e amanhã. ☕',
        question:
          'Há quanto tempo você está dormindo mal?\n\n1️⃣ Esta semana\n2️⃣ Este mês\n3️⃣ Alguns meses\n4️⃣ Faz muito tempo',
        options: [
          { number: 1, label: 'Esta semana' },
          { number: 2, label: 'Este mês' },
          { number: 3, label: 'Alguns meses' },
          { number: 4, label: 'Faz muito tempo' },
        ],
      },
    },
  },
];

export function getFollowUp(
  pillar: HealthPillar,
  optionNumber: number,
): FollowUpStep | null {
  const tree = FOLLOW_UP_TREES.find((t) => t.pillar === pillar);
  return tree?.byOption[optionNumber] ?? null;
}
