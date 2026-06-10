import { Logger } from '@nestjs/common';
import Parser from 'rss-parser';
import { BaseSource } from './base.source';
import { RawNewsItem, NewsCategory } from '../interfaces/raw-news.interface';

export interface RssFeedConfig {
  name: string;
  url: string;
  category: NewsCategory;
}

export class RssSource extends BaseSource {
  private readonly logger = new Logger(RssSource.name);
  private readonly parser = new Parser({ timeout: 10_000 });

  readonly name: string;

  constructor(private readonly config: RssFeedConfig) {
    super();
    this.name = config.name;
  }

  async fetch(): Promise<RawNewsItem[]> {
    try {
      const feed = await this.parser.parseURL(this.config.url);

      return feed.items
        .filter((item) => item.title && item.link)
        .map((item) => ({
          title: item.title!.trim(),
          description:
            item.contentSnippet?.trim() ?? item.summary?.trim() ?? null,
          url: item.link!,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          sourceName: this.config.name,
          category: this.config.category,
        }));
    } catch (error) {
      this.logger.error(
        `Failed to fetch "${this.config.name}": ${(error as Error).message}`,
      );
      return [];
    }
  }
}
