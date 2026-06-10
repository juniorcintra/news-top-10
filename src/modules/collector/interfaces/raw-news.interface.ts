export type NewsCategory = 'economy' | 'business' | 'politics';

export interface RawNewsItem {
  title: string;
  description: string | null;
  url: string;
  publishedAt: Date;
  sourceName: string;
  category: NewsCategory;
}
