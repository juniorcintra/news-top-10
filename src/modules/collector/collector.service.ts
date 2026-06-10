import { Injectable, Logger } from '@nestjs/common';
import { RssSource, RssFeedConfig } from './sources/rss.source';
import { RawNewsItem } from './interfaces/raw-news.interface';

const RSS_FEEDS: RssFeedConfig[] = [
  {
    name: 'G1 Economia',
    url: 'https://g1.globo.com/rss/g1/economia/noticia/',
    category: 'economy',
  },
  {
    name: 'G1 Política',
    url: 'https://g1.globo.com/rss/g1/politica/',
    category: 'politics',
  },
  {
    name: 'InfoMoney',
    url: 'https://www.infomoney.com.br/feed/',
    category: 'business',
  },
  {
    name: 'Valor Econômico',
    url: 'https://valor.globo.com/rss/ultimas-noticias/',
    category: 'economy',
  },
  {
    name: 'Agência Brasil Economia',
    url: 'https://agenciabrasil.ebc.com.br/rss/economia/feed.rss',
    category: 'economy',
  },
  {
    name: 'Agência Brasil Política',
    url: 'https://agenciabrasil.ebc.com.br/rss/politica/feed.rss',
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
