import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  @Post('whatsapp')
  @HttpCode(HttpStatus.OK)
  handleWhatsapp(@Body() body: Record<string, string>): string {
    const from = body['From'] ?? '';
    const messageBody = body['Body'] ?? '';

    this.logger.log(`Incoming webhook — From: ${from}`);
    void this.webhookService.handleIncoming(from, messageBody);

    return '';
  }
}
