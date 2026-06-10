import { Injectable, Logger } from '@nestjs/common';
import { RssSource, RssFeedConfig } from './sources/rss.source';
import { RawNewsItem } from './interfaces/raw-news.interface';

const RSS_FEEDS: RssFeedConfig[] = [
  {
    name: 'G1 Economia',
    url: 'https://g1.globo.com/rss/g1/economia',
    category: 'economy',
  },
  {
    name: 'G1 Política',
    url: 'https://g1.globo.com/rss/g1/politica',
    category: 'politics',
  },
  {
    name: 'InfoMoney',
    url: 'https://www.infomoney.com.br/feed/',
    category: 'business',
  },
  {
    name: 'Folha Mercado',
    url: 'https://feeds.folha.uol.com.br/mercado/rss091.xml',
    category: 'economy',
  },
  {
    name: 'Folha Poder',
    url: 'https://feeds.folha.uol.com.br/poder/rss091.xml',
    category: 'politics',
  },
  {
    name: 'Agência Brasil Economia',
    url: 'http://agenciabrasil.ebc.com.br/rss/economia/feed.xml',
    category: 'economy',
  },
  {
    name: 'Agência Brasil Política',
    url: 'http://agenciabrasil.ebc.com.br/rss/politica/feed.xml',
    category: 'politics',
  },
  {
    name: 'BBC Business',
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    category: 'business',
  },
];

@Injectable()
export class CollectorService {
  private readonly logger = new Logger(CollectorService.name);
  private readonly sources: RssSource[];

  constructor() {
    this.sources = RSS_FEEDS.map((feed) => new RssSource(feed));
  }

  async collectAll(): Promise<RawNewsItem[]> {
    this.logger.log(
      `Starting collection from ${this.sources.length} RSS sources...`,
    );

    const results = await Promise.allSettled(
      this.sources.map((source) => source.fetch()),
    );

    const articles: RawNewsItem[] = [];

    for (const [i, result] of results.entries()) {
      const sourceName = this.sources[i].name;
      if (result.status === 'fulfilled') {
        this.logger.log(`[OK] ${sourceName}: ${result.value.length} articles`);
        articles.push(...result.value);
      } else {
        this.logger.warn(`[FAIL] ${sourceName}: ${String(result.reason)}`);
      }
    }

    this.logger.log(`Collection finished. Total: ${articles.length} articles.`);
    return articles;
  }
}
