import { RawNewsItem } from '../../collector/interfaces/raw-news.interface';

export interface ScoredNewsItem extends RawNewsItem {
  score: number;
}
