import { RawNewsItem } from '../interfaces/raw-news.interface';

export abstract class BaseSource {
  abstract readonly name: string;
  abstract fetch(): Promise<RawNewsItem[]>;
}
