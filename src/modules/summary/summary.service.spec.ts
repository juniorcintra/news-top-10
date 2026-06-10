import { SummaryService } from './summary.service';
import { ScoredNewsItem } from '../ranking/interfaces/scored-news.interface';

function makeArticle(overrides: Partial<ScoredNewsItem> = {}): ScoredNewsItem {
  return {
    title: 'Test Article',
    description: 'A test description.',
    url: 'https://example.com',
    publishedAt: new Date(),
    sourceName: 'G1 Economia',
    category: 'economy',
    score: 0.8,
    ...overrides,
  };
}

describe('SummaryService', () => {
  let service: SummaryService;

  const mockPrisma = {
    dailySummary: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SummaryService(mockPrisma as never);
  });

  describe('generateAndSave()', () => {
    it('returns existing summary without creating a new one', async () => {
      const existing = { id: '1', content: 'cached summary' };
      mockPrisma.dailySummary.findUnique.mockResolvedValue(existing);

      const result = await service.generateAndSave([makeArticle()]);

      expect(result).toBe(existing);
      expect(mockPrisma.dailySummary.create).not.toHaveBeenCalled();
    });

    it('creates a new summary when none exists for today', async () => {
      mockPrisma.dailySummary.findUnique.mockResolvedValue(null);
      const created = { id: '2', content: 'new summary' };
      mockPrisma.dailySummary.create.mockResolvedValue(created);

      const result = await service.generateAndSave([makeArticle()]);

      expect(mockPrisma.dailySummary.create).toHaveBeenCalledTimes(1);
      expect(result).toBe(created);
    });

    it('persists the formatted message content', async () => {
      mockPrisma.dailySummary.findUnique.mockResolvedValue(null);
      mockPrisma.dailySummary.create.mockImplementation(
        ({ data }: { data: { content: string } }) =>
          Promise.resolve({ id: '1', ...data }),
      );

      await service.generateAndSave([makeArticle({ title: 'Market Crash' })]);

      const calls = mockPrisma.dailySummary.create.mock
        .calls as unknown as Array<[{ data: { content: string } }]>;
      expect(calls[0][0].data.content).toContain('Market Crash');
    });

    it('sets articleIds as empty array and tokensUsed as 0', async () => {
      mockPrisma.dailySummary.findUnique.mockResolvedValue(null);
      mockPrisma.dailySummary.create.mockResolvedValue({});

      await service.generateAndSave([makeArticle()]);

      const calls = mockPrisma.dailySummary.create.mock
        .calls as unknown as Array<
        [{ data: { articleIds: unknown[]; tokensUsed: number } }]
      >;
      const { data } = calls[0][0];
      expect(data.articleIds).toEqual([]);
      expect(data.tokensUsed).toBe(0);
    });
  });

  describe('formatMessage() — via generateAndSave()', () => {
    beforeEach(() => {
      mockPrisma.dailySummary.findUnique.mockResolvedValue(null);
      mockPrisma.dailySummary.create.mockImplementation(
        ({ data }: { data: { content: string } }) =>
          Promise.resolve({ id: '1', ...data }),
      );
    });

    function getContent(): string {
      const calls = mockPrisma.dailySummary.create.mock
        .calls as unknown as Array<[{ data: { content: string } }]>;
      return calls[0][0].data.content;
    }

    it('includes the TOP 10 header with current date', async () => {
      await service.generateAndSave([makeArticle()]);
      expect(getContent()).toMatch(/TOP 10 NOTICIAS DO DIA/);
    });

    it('numbers articles starting from 1', async () => {
      const articles = [
        makeArticle({ title: 'First' }),
        makeArticle({ title: 'Second' }),
      ];
      await service.generateAndSave(articles);
      const content = getContent();
      expect(content).toContain('1.');
      expect(content).toContain('2.');
    });

    it('includes title, source name, and URL for each article', async () => {
      const article = makeArticle({
        title: 'Selic sobe 0.5%',
        sourceName: 'InfoMoney',
        url: 'https://infomoney.com.br/selic',
      });
      await service.generateAndSave([article]);
      const content = getContent();
      expect(content).toContain('Selic sobe 0.5%');
      expect(content).toContain('InfoMoney');
      expect(content).toContain('https://infomoney.com.br/selic');
    });

    it('uses ECONOMIA label for economy category', async () => {
      await service.generateAndSave([makeArticle({ category: 'economy' })]);
      expect(getContent()).toContain('ECONOMIA');
    });

    it('uses NEGOCIOS label for business category', async () => {
      await service.generateAndSave([makeArticle({ category: 'business' })]);
      expect(getContent()).toContain('NEGOCIOS');
    });

    it('uses POLITICA label for politics category', async () => {
      await service.generateAndSave([makeArticle({ category: 'politics' })]);
      expect(getContent()).toContain('POLITICA');
    });
  });
});
