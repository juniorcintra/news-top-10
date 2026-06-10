import { Injectable, Logger } from '@nestjs/common';
import {
  RawNewsItem,
  NewsCategory,
} from '../collector/interfaces/raw-news.interface';
import { ScoredNewsItem } from './interfaces/scored-news.interface';

const CATEGORY_KEYWORDS: Record<NewsCategory, string[]> = {
  economy: [
    'inflação',
    'pib',
    'selic',
    'dólar',
    'mercado',
    'economia',
    'bolsa',
    'banco central',
    'fiscal',
    'juros',
    'petróleo',
    'exportação',
    'importação',
    'câmbio',
    'recessão',
    'desemprego',
  ],
  business: [
    'empresa',
    'lucro',
    'resultado',
    'receita',
    'investimento',
    'startup',
    'fusão',
    'aquisição',
    'ipo',
    'ações',
    'vendas',
    'ceo',
    'corporativo',
    'negócios',
    'setor',
  ],
  politics: [
    'governo',
    'congresso',
    'senado',
    'câmara',
    'presidente',
    'ministro',
    'reforma',
    'lei',
    'eleição',
    'partido',
    'stf',
    'votação',
    'decreto',
    'política',
    'oposição',
    'veto',
  ],
};

const SOURCE_WEIGHTS: Record<string, number> = {
  'Folha Mercado': 1.0,
  'BBC Business': 0.9,
  InfoMoney: 0.85,
  'Folha Poder': 0.85,
  'G1 Economia': 0.75,
  'G1 Política': 0.75,
  'Agência Brasil Economia': 0.65,
  'Agência Brasil Política': 0.65,
};

const MIN_PER_CATEGORY = 2;

const DEFAULT_SOURCE_WEIGHT = 0.5;
const MAX_AGE_MINUTES = 24 * 60;
const KEYWORD_MATCH_THRESHOLD = 3;
const ENGAGEMENT_DESCRIPTION_LENGTH = 400;

@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);

  rank(articles: RawNewsItem[], topN = 10): ScoredNewsItem[] {
    if (articles.length === 0) {
      this.logger.warn('No articles to rank.');
      return [];
    }

    const now = new Date();

    const scored: ScoredNewsItem[] = articles.map((article) => ({
      ...article,
      score: this.calculateScore(article, now),
    }));

    scored.sort((a, b) => b.score - a.score);

    const byCategory = new Map<string, ScoredNewsItem[]>();
    for (const article of scored) {
      const group = byCategory.get(article.category) ?? [];
      group.push(article);
      byCategory.set(article.category, group);
    }

    const selected = new Set<ScoredNewsItem>();

    for (const group of byCategory.values()) {
      group.slice(0, MIN_PER_CATEGORY).forEach((a) => selected.add(a));
    }

    for (const article of scored) {
      if (selected.size >= topN) break;
      selected.add(article);
    }

    const top = [...selected].sort((a, b) => b.score - a.score).slice(0, topN);

    const dist = [...byCategory.keys()]
      .map((cat) => `${cat}:${top.filter((a) => a.category === cat).length}`)
      .join(', ');

    this.logger.log(
      `Ranked ${articles.length} articles → top ${top.length} selected. ` +
        `Distribution: [${dist}]. ` +
        `Score range: ${top[0]?.score.toFixed(3)} → ${top[top.length - 1]?.score.toFixed(3)}`,
    );

    return top;
  }

  private calculateScore(article: RawNewsItem, now: Date): number {
    const recency = this.scoreRecency(article.publishedAt, now);
    const keywords = this.scoreKeywords(article);
    const source = this.scoreSource(article.sourceName);
    const engagement = this.scoreEngagement(article.description);

    return 0.4 * recency + 0.3 * keywords + 0.2 * source + 0.1 * engagement;
  }

  private scoreRecency(publishedAt: Date, now: Date): number {
    const ageMinutes = (now.getTime() - publishedAt.getTime()) / 60_000;
    return Math.max(0, 1 - ageMinutes / MAX_AGE_MINUTES);
  }

  private scoreKeywords(article: RawNewsItem): number {
    const text = `${article.title} ${article.description ?? ''}`.toLowerCase();
    const keywords = CATEGORY_KEYWORDS[article.category];
    const matches = keywords.filter((kw) => text.includes(kw)).length;
    return Math.min(matches / KEYWORD_MATCH_THRESHOLD, 1);
  }

  private scoreSource(sourceName: string): number {
    return SOURCE_WEIGHTS[sourceName] ?? DEFAULT_SOURCE_WEIGHT;
  }

  private scoreEngagement(description: string | null): number {
    if (!description) return 0;
    return Math.min(description.length / ENGAGEMENT_DESCRIPTION_LENGTH, 1);
  }
}
