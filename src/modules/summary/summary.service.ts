import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScoredNewsItem } from '../ranking/interfaces/scored-news.interface';

const CATEGORY_LABEL: Record<string, string> = {
  economy: 'ECONOMIA',
  business: 'NEGOCIOS',
  politics: 'POLITICA',
};

@Injectable()
export class SummaryService {
  private readonly logger = new Logger(SummaryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateAndSave(articles: ScoredNewsItem[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.dailySummary.findUnique({
      where: { summaryDate: today },
    });

    if (existing) {
      this.logger.warn('Summary for today already exists. Skipping.');
      return existing;
    }

    const content = this.formatMessage(articles);

    const summary = await this.prisma.dailySummary.create({
      data: {
        summaryDate: today,
        content,
        articleIds: [],
        tokensUsed: 0,
      },
    });

    this.logger.log(`Summary created for ${today.toISOString().split('T')[0]}`);

    return summary;
  }

  private formatMessage(articles: ScoredNewsItem[]): string {
    const dateStr = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const lines: string[] = [`*TOP 10 NOTICIAS DO DIA - ${dateStr}*`, ''];

    articles.forEach((article, index) => {
      const label =
        CATEGORY_LABEL[article.category] ?? article.category.toUpperCase();

      lines.push(`${index + 1}. *${label}* | ${article.title}`);
      lines.push(`Fonte: ${article.sourceName}`);
      lines.push(`Link: ${article.url}`);
      lines.push('');
    });

    return lines.join('\n');
  }
}
