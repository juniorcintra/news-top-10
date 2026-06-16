import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface PillarSummary {
  pillar: string;
  avgScore: number;
  totalResponses: number;
  criticalCount: number;
}

export interface CompanyMetrics {
  companyId: string;
  period: { from: string; to: string };
  avgWellbeingScore: number;
  burnoutAlertActive: boolean;
  totalActiveUsers: number;
  responseRate: number;
  byPillar: PillarSummary[];
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getCompanyMetrics(
    companyId: string,
    days = 7,
  ): Promise<CompanyMetrics> {
    const from = new Date();
    from.setDate(from.getDate() - days);
    from.setHours(0, 0, 0, 0);

    const users = await this.prisma.user.findMany({
      where: { companyId, active: true },
      select: { id: true },
    });

    const userIds = users.map((u) => u.id);
    const totalActiveUsers = userIds.length;

    const checkIns = await this.prisma.checkIn.findMany({
      where: { userId: { in: userIds }, date: { gte: from } },
      select: {
        pillar: true,
        scoreConverted: true,
        isCritical: true,
        userId: true,
      },
    });

    const totalExpected = totalActiveUsers * days;
    const responseRate =
      totalExpected > 0
        ? Math.round((checkIns.length / totalExpected) * 100)
        : 0;

    const scores = checkIns
      .map((c) => c.scoreConverted)
      .filter((s): s is number => s !== null);

    const avgWellbeingScore =
      scores.length > 0
        ? Math.round(
            (scores.reduce((a, b) => a + b, 0) / scores.length) * 100,
          ) / 100
        : 0;

    const criticalTotal = checkIns.filter((c) => c.isCritical).length;
    const burnoutAlertActive =
      criticalTotal > 0 && criticalTotal / checkIns.length >= 0.3;

    const pillarMap = new Map<string, { scores: number[]; critical: number }>();
    for (const ci of checkIns) {
      const entry = pillarMap.get(ci.pillar) ?? { scores: [], critical: 0 };
      if (ci.scoreConverted !== null) entry.scores.push(ci.scoreConverted);
      if (ci.isCritical) entry.critical += 1;
      pillarMap.set(ci.pillar, entry);
    }

    const byPillar: PillarSummary[] = Array.from(pillarMap.entries()).map(
      ([pillar, data]) => ({
        pillar,
        avgScore:
          data.scores.length > 0
            ? Math.round(
                (data.scores.reduce((a, b) => a + b, 0) / data.scores.length) *
                  100,
              ) / 100
            : 0,
        totalResponses: data.scores.length,
        criticalCount: data.critical,
      }),
    );

    return {
      companyId,
      period: {
        from: from.toISOString().split('T')[0] ?? '',
        to: new Date().toISOString().split('T')[0] ?? '',
      },
      avgWellbeingScore,
      burnoutAlertActive,
      totalActiveUsers,
      responseRate,
      byPillar,
    };
  }

  async getBurnoutRisk(companyId: string): Promise<{
    companyId: string;
    usersAtRisk: number;
    totalActiveUsers: number;
    riskPercentage: number;
  }> {
    const users = await this.prisma.user.findMany({
      where: { companyId, active: true },
      select: { id: true },
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let usersAtRisk = 0;

    for (const user of users) {
      const recent = await this.prisma.checkIn.findMany({
        where: { userId: user.id, date: { gte: sevenDaysAgo } },
        orderBy: { date: 'desc' },
        take: 3,
        select: { isCritical: true },
      });

      if (recent.length === 3 && recent.every((c) => c.isCritical)) {
        usersAtRisk++;
      }
    }

    const totalActiveUsers = users.length;
    const riskPercentage =
      totalActiveUsers > 0
        ? Math.round((usersAtRisk / totalActiveUsers) * 100)
        : 0;

    return { companyId, usersAtRisk, totalActiveUsers, riskPercentage };
  }
}
