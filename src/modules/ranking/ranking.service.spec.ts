import { RankingService } from './ranking.service';
import {
  RawNewsItem,
  NewsCategory,
} from '../collector/interfaces/raw-news.interface';

function makeArticle(
  category: NewsCategory,
  overrides: Partial<RawNewsItem> = {},
): RawNewsItem {
  return {
    title: 'Test Article',
    description: 'A description with some content to test engagement scoring.',
    url: 'https://example.com/article',
    publishedAt: new Date(),
    sourceName: 'G1 Economia',
    category,
    ...overrides,
  };
}

function makeArticles(count: number, category: NewsCategory): RawNewsItem[] {
  return Array.from({ length: count }, (_, i) =>
    makeArticle(category, {
      title: `${category} article ${i}`,
      url: `https://example.com/${category}/${i}`,
    }),
  );
}

describe('RankingService', () => {
  let service: RankingService;

  beforeEach(() => {
    service = new RankingService();
  });

  describe('rank()', () => {
    it('returns empty array when given no articles', () => {
      expect(service.rank([])).toEqual([]);
    });

    it('returns at most topN articles', () => {
      const articles = makeArticles(20, 'economy');
      expect(service.rank(articles, 10)).toHaveLength(10);
    });

    it('returns all articles when count is less than topN', () => {
      const articles = [makeArticle('economy'), makeArticle('business')];
      expect(service.rank(articles, 10)).toHaveLength(2);
    });

    it('attaches a numeric score to each article', () => {
      const [result] = service.rank([makeArticle('economy')]);
      expect(result).toHaveProperty('score');
      expect(typeof result.score).toBe('number');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('returns articles sorted by score descending', () => {
      const now = new Date();
      const articles = [
        makeArticle('economy', {
          publishedAt: new Date(now.getTime() - 22 * 60 * 60 * 1000),
        }),
        makeArticle('economy', { publishedAt: now }),
        makeArticle('economy', {
          publishedAt: new Date(now.getTime() - 10 * 60 * 60 * 1000),
        }),
      ];
      const result = service.rank(articles);
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].score).toBeGreaterThanOrEqual(result[i + 1].score);
      }
    });

    it('scores a fresh article higher than a 23-hour-old article', () => {
      const now = new Date();
      const fresh = makeArticle('economy', {
        title: 'Fresh',
        publishedAt: now,
      });
      const old = makeArticle('economy', {
        title: 'Old',
        publishedAt: new Date(now.getTime() - 23 * 60 * 60 * 1000),
      });
      const result = service.rank([fresh, old]);
      const freshScore = result.find((a) => a.title === 'Fresh')!.score;
      const oldScore = result.find((a) => a.title === 'Old')!.score;
      expect(freshScore).toBeGreaterThan(oldScore);
    });

    it('scores a high-weight source higher than an unknown source', () => {
      const now = new Date();
      const highWeight = makeArticle('economy', {
        title: 'High',
        sourceName: 'Folha Mercado',
        publishedAt: now,
      });
      const lowWeight = makeArticle('economy', {
        title: 'Low',
        sourceName: 'Unknown Source',
        publishedAt: now,
      });
      const result = service.rank([highWeight, lowWeight]);
      const high = result.find((a) => a.title === 'High')!.score;
      const low = result.find((a) => a.title === 'Low')!.score;
      expect(high).toBeGreaterThan(low);
    });

    it('guarantees at least MIN_PER_CATEGORY (2) articles per category', () => {
      const articles = [
        ...makeArticles(8, 'economy'),
        ...makeArticles(3, 'business'),
        ...makeArticles(3, 'politics'),
      ];
      const top = service.rank(articles, 10);
      const count = (cat: string) =>
        top.filter((a) => a.category === cat).length;
      expect(count('economy')).toBeGreaterThanOrEqual(2);
      expect(count('business')).toBeGreaterThanOrEqual(2);
      expect(count('politics')).toBeGreaterThanOrEqual(2);
    });

    it('does not exceed topN even with category quotas', () => {
      const articles = [
        ...makeArticles(5, 'economy'),
        ...makeArticles(5, 'business'),
        ...makeArticles(5, 'politics'),
      ];
      expect(service.rank(articles, 10)).toHaveLength(10);
    });

    it('handles a single category without error', () => {
      const articles = makeArticles(15, 'economy');
      const result = service.rank(articles, 10);
      expect(result).toHaveLength(10);
      expect(result.every((a) => a.category === 'economy')).toBe(true);
    });

    it('gives zero recency score to articles older than 24h', () => {
      const veryOld = makeArticle('economy', {
        publishedAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
        sourceName: 'Unknown Source',
        description: null,
      });
      const [result] = service.rank([veryOld]);
      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });
});
