import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  findByPhone(phone: string) {
    return this.prisma.user.findUnique({ where: { whatsappPhone: phone } });
  }

  async findOrCreate(phone: string) {
    const existing = await this.findByPhone(phone);
    if (existing) return existing;

    this.logger.log(`Auto-registering new user: +${phone}`);
    return this.prisma.user.create({ data: { whatsappPhone: phone } });
  }

  findAllActive() {
    return this.prisma.user.findMany({ where: { active: true } });
  }

  updateName(id: string, name: string) {
    return this.prisma.user.update({ where: { id }, data: { name } });
  }
}
