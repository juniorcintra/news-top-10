import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus(): object {
    return { service: 'Calmai', status: 'online', version: '1.0.0' };
  }
}
