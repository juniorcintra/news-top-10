jest.mock('twilio', () => jest.fn());

import { WhatsappService } from './whatsapp.service';

describe('WhatsappService', () => {
  let service: WhatsappService;

  const mockConfig = { get: jest.fn() };
  const mockPrisma = {
    notificationLog: { create: jest.fn() },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfig.get.mockReturnValue(undefined);
    mockPrisma.notificationLog.create.mockResolvedValue({});
    service = new WhatsappService(mockConfig as never, mockPrisma as never);
  });

  describe('splitMessage()', () => {
    it('returns single chunk when content fits within limit', () => {
      const result = (
        service as never as { splitMessage: (c: string, l: number) => string[] }
      ).splitMessage('short message', 1500);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('short message');
    });

    it('returns single chunk when content is exactly at limit', () => {
      const content = 'A'.repeat(1500);
      const result = (
        service as never as { splitMessage: (c: string, l: number) => string[] }
      ).splitMessage(content, 1500);
      expect(result).toHaveLength(1);
    });

    it('splits into multiple chunks when content exceeds limit', () => {
      const block = 'X'.repeat(600);
      const content = `${block}\n\n${block}\n\n${block}`;
      const result = (
        service as never as { splitMessage: (c: string, l: number) => string[] }
      ).splitMessage(content, 1500);
      expect(result.length).toBeGreaterThan(1);
    });

    it('each chunk respects the character limit', () => {
      const block = 'Y'.repeat(600);
      const content = `${block}\n\n${block}\n\n${block}`;
      const result = (
        service as never as { splitMessage: (c: string, l: number) => string[] }
      ).splitMessage(content, 1500);
      result.forEach((chunk) => expect(chunk.length).toBeLessThanOrEqual(1500));
    });

    it('splits at paragraph boundaries, not mid-paragraph', () => {
      const para1 = 'First paragraph ' + 'A'.repeat(800);
      const para2 = 'Second paragraph ' + 'B'.repeat(800);
      const content = `${para1}\n\n${para2}`;
      const result = (
        service as never as { splitMessage: (c: string, l: number) => string[] }
      ).splitMessage(content, 1500);
      expect(result[0]).toContain('First paragraph');
      expect(result[1]).toContain('Second paragraph');
    });
  });

  describe('send() — dry-run mode (no credentials)', () => {
    it('creates a notification log with dry-run status', async () => {
      await service.send('summary-123', 'Test message');

      expect(mockPrisma.notificationLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            summaryId: 'summary-123',
            status: 'sent',
            providerResponse: 'dry-run',
          }) as Record<string, unknown>,
        }) as Record<string, unknown>,
      );
    });

    it('uses "unknown" as recipient when not configured', async () => {
      await service.send('summary-123', 'Test message');

      type LogArg = {
        data: {
          summaryId: string;
          status: string;
          providerResponse: string;
          recipient: string;
        };
      };
      const calls = mockPrisma.notificationLog.create.mock
        .calls as unknown as Array<[LogArg]>;
      expect(calls[0][0].data.recipient).toBe('unknown');
    });

    it('uses configured recipient when available', async () => {
      mockConfig.get.mockImplementation((key: string) =>
        key === 'whatsapp.recipient' ? '5511999999999' : undefined,
      );
      service = new WhatsappService(mockConfig as never, mockPrisma as never);

      await service.send('summary-123', 'Test message');

      type LogArg = {
        data: {
          summaryId: string;
          status: string;
          providerResponse: string;
          recipient: string;
        };
      };
      const calls = mockPrisma.notificationLog.create.mock
        .calls as unknown as Array<[LogArg]>;
      expect(calls[0][0].data.recipient).toBe('5511999999999');
    });

    it('does not throw when content is empty string', async () => {
      await expect(service.send('id', '')).resolves.not.toThrow();
    });

    it('prints multi-part label when message requires splitting', async () => {
      const consoleSpy = jest
        .spyOn(console, 'log')
        .mockImplementation(() => undefined);
      const block = 'Z'.repeat(600);
      const longContent = `${block}\n\n${block}\n\n${block}`;

      await service.send('id', longContent);

      const output = consoleSpy.mock.calls
        .map((c) => c[0] as string)
        .join('\n');
      expect(output).toContain('Part 1');
      consoleSpy.mockRestore();
    });
  });
});
