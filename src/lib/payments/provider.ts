import { randomBytes, createHmac, timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';
import type {
  PaymentProvider,
  PaymentProviderConfig,
  CreatePaymentRequest,
  CreatePaymentResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  RefundPaymentRequest,
  RefundPaymentResponse,
  WebhookPayload,
  ProcessedWebhookResult,
  PaymentMethodType,
  PaymentProviderType,
  PaymentStatus,
} from './types';

export abstract class BasePaymentProvider implements PaymentProvider {
  abstract readonly name: PaymentProviderType;
  abstract readonly supportedMethods: PaymentMethodType[];
  abstract readonly supportsRefunds: boolean;
  abstract readonly supportsWebhooks: boolean;

  protected config: PaymentProviderConfig;
  protected idempotencyStore = new Map<string, { key: string; createdAt: number }>();

  constructor(config: PaymentProviderConfig) {
    this.config = config;
    this.cleanupIdempotencyStore();
    setInterval(() => this.cleanupIdempotencyStore(), 60 * 60 * 1000);
  }

  abstract createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse>;
  abstract verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse>;
  abstract refundPayment?(request: RefundPaymentRequest): Promise<RefundPaymentResponse>;
  abstract handleWebhook(payload: WebhookPayload): Promise<ProcessedWebhookResult>;
  abstract constructWebhookEvent(rawBody: string | Buffer, signature: string): WebhookPayload;

  protected generateIdempotencyKey(prefix = 'pay'): string {
    return `${prefix}_${Date.now()}_${randomBytes(8).toString('hex')}`;
  }

  protected async checkIdempotency(key: string): Promise<{ exists: boolean; paymentId?: string }> {
    const existing = await prisma.payment.findFirst({
      where: { metadata: { path: ['idempotencyKey'], equals: key } },
      select: { id: true },
    });
    return { exists: !!existing, paymentId: existing?.id };
  }

  protected storeIdempotencyKey(key: string): void {
    this.idempotencyStore.set(key, { key, createdAt: Date.now() });
  }

  protected hasIdempotencyKey(key: string): boolean {
    return this.idempotencyStore.has(key);
  }

  private cleanupIdempotencyStore(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000;
    for (const [key, value] of Array.from(this.idempotencyStore.entries())) {
      if (now - value.createdAt > maxAge) {
        this.idempotencyStore.delete(key);
      }
    }
  }

  protected verifySignature(payload: string | Buffer, signature: string, secret: string): boolean {
    try {
      const expected = createHmac('sha256', secret).update(payload).digest('hex');
      const provided = signature.replace(/^sha256=/, '');
      return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
    } catch {
      return false;
    }
  }

  protected parseWebhookTimestamp(headers: Record<string, string>): Date | null {
    const timestamp = headers['stripe-timestamp'] || headers['paypal-transmission-time'] || headers['x-webhook-timestamp'];
    if (timestamp) {
      const ts = parseInt(timestamp, 10);
      if (!isNaN(ts)) return new Date(ts * (timestamp.length === 13 ? 1 : 1000));
    }
    return null;
  }

  protected isWebhookReplay(headers: Record<string, string>, maxAgeSeconds = 300): boolean {
    const timestamp = this.parseWebhookTimestamp(headers);
    if (!timestamp) return false;
    const age = (Date.now() - timestamp.getTime()) / 1000;
    return age > maxAgeSeconds;
  }

  protected mapProviderStatusToInternal(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      succeeded: 'completed',
      paid: 'completed',
      completed: 'completed',
      processing: 'processing',
      pending: 'pending',
      requires_action: 'pending',
      requires_confirmation: 'pending',
      requires_capture: 'pending',
      canceled: 'cancelled',
      failed: 'failed',
      expired: 'failed',
      refunded: 'refunded',
      partially_refunded: 'refunded',
      disputed: 'disputed',
      chargeback: 'disputed',
    };
    return statusMap[status.toLowerCase()] || 'pending';
  }

  protected async recordPaymentAttempt(
    paymentId: string,
    provider: PaymentProviderType,
    providerPaymentId: string,
    status: PaymentStatus,
    rawResponse: unknown
  ): Promise<void> {
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: status.toUpperCase() as any,
        providerData: rawResponse as any,
        ...(status === 'completed' && { completedAt: new Date() }),
      },
    });
  }
}

export class PaymentProviderRegistry {
  private static providers = new Map<PaymentProviderType, PaymentProvider>();

  static register(provider: PaymentProvider): void {
    this.providers.set(provider.name, provider);
  }

  static get(provider: PaymentProviderType): PaymentProvider | undefined {
    return this.providers.get(provider);
  }

  static getAll(): PaymentProvider[] {
    return Array.from(this.providers.values());
  }

  static getSupportedMethods(provider: PaymentProviderType): PaymentMethodType[] {
    return this.providers.get(provider)?.supportedMethods || [];
  }

  static supportsRefunds(provider: PaymentProviderType): boolean {
    return this.providers.get(provider)?.supportsRefunds || false;
  }

  static supportsWebhooks(provider: PaymentProviderType): boolean {
    return this.providers.get(provider)?.supportsWebhooks || false;
  }
}