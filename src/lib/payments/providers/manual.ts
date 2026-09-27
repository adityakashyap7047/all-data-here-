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
} from '../types';
import { BasePaymentProvider } from '../provider';
import { prisma } from '@/lib/prisma';

export class ManualPaymentProvider extends BasePaymentProvider implements PaymentProvider {
  readonly name: PaymentProviderType = 'manual';
  readonly supportedMethods: PaymentMethodType[] = ['balance', 'bank_transfer'];
  readonly supportsRefunds = true;
  readonly supportsWebhooks = false;

  constructor(config: PaymentProviderConfig) {
    super(config);
  }

  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    const { amount, currency, metadata, idempotencyKey } = request;

    const existing = await this.checkIdempotency(idempotencyKey);
    if (existing.exists) {
      const payment = await prisma.payment.findUnique({
        where: { id: existing.paymentId },
      });
      return {
        paymentId: payment!.id,
        providerPaymentId: payment!.id,
        status: payment!.status as PaymentStatus,
        rawResponse: payment,
      };
    }

    const payment = await prisma.payment.create({
      data: {
        userId: metadata.userId,
        invoiceId: metadata.invoiceId,
        amount,
        currency,
        method: request.method.toUpperCase() as any,
        status: 'PENDING',
        provider: 'MANUAL',
        metadata: { ...metadata, idempotencyKey },
      },
    });

    this.storeIdempotencyKey(idempotencyKey);

    return {
      paymentId: payment.id,
      providerPaymentId: payment.id,
      status: 'pending',
      rawResponse: payment,
    };
  }

  async verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    const payment = await prisma.payment.findUnique({
      where: { id: request.paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return {
      status: payment.status.toLowerCase() as PaymentStatus,
      paidAt: payment.completedAt || undefined,
      rawResponse: payment,
    };
  }

  async refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResponse> {
    const payment = await prisma.payment.findUnique({
      where: { id: request.paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'COMPLETED') {
      throw new Error('Can only refund completed payments');
    }

    const refundAmount = request.amount || Number(payment.amount);
    if (refundAmount > Number(payment.amount)) {
      throw new Error('Refund amount exceeds payment amount');
    }

    const refund = await prisma.payment.create({
      data: {
        userId: payment.userId,
        invoiceId: payment.invoiceId,
        amount: refundAmount,
        currency: payment.currency,
        method: payment.method,
        status: 'REFUNDED',
        provider: 'MANUAL',
        metadata: {
          originalPaymentId: payment.id,
          reason: request.reason,
          type: 'refund',
        },
      },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'REFUNDED' },
    });

    return {
      refundId: refund.id,
      status: 'refunded',
      rawResponse: refund,
    };
  }

  async handleWebhook(payload: WebhookPayload): Promise<ProcessedWebhookResult> {
    return { paymentId: '', status: 'pending', action: 'ignored' };
  }

  constructWebhookEvent(_rawBody: string | Buffer, _signature: string): WebhookPayload {
    throw new Error('Manual provider does not support webhooks');
  }
}

export class BalancePaymentProvider extends BasePaymentProvider implements PaymentProvider {
  readonly name: PaymentProviderType = 'balance';
  readonly supportedMethods: PaymentMethodType[] = ['balance'];
  readonly supportsRefunds = true;
  readonly supportsWebhooks = false;

  constructor(config: PaymentProviderConfig) {
    super(config);
  }

  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    const { amount, currency, metadata, idempotencyKey } = request;

    if (!metadata.userId) {
      throw new Error('User ID required for balance payment');
    }

    const existing = await this.checkIdempotency(idempotencyKey);
    if (existing.exists) {
      const payment = await prisma.payment.findUnique({
        where: { id: existing.paymentId },
      });
      return {
        paymentId: payment!.id,
        providerPaymentId: payment!.id,
        status: payment!.status as PaymentStatus,
        rawResponse: payment,
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: metadata.userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const payment = await prisma.payment.create({
      data: {
        userId: metadata.userId,
        invoiceId: metadata.invoiceId,
        amount,
        currency,
        method: 'BALANCE',
        status: 'PROCESSING',
        provider: 'BALANCE',
        metadata: { ...metadata, idempotencyKey },
      },
    });

    this.storeIdempotencyKey(idempotencyKey);

    return {
      paymentId: payment.id,
      providerPaymentId: payment.id,
      status: 'processing',
      rawResponse: payment,
    };
  }

  async verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    const payment = await prisma.payment.findUnique({
      where: { id: request.paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return {
      status: payment.status.toLowerCase() as PaymentStatus,
      paidAt: payment.completedAt || undefined,
      rawResponse: payment,
    };
  }

  async refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResponse> {
    const payment = await prisma.payment.findUnique({
      where: { id: request.paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'COMPLETED') {
      throw new Error('Can only refund completed payments');
    }

    const refundAmount = request.amount || Number(payment.amount);
    if (refundAmount > Number(payment.amount)) {
      throw new Error('Refund amount exceeds payment amount');
    }

    const refund = await prisma.payment.create({
      data: {
        userId: payment.userId,
        invoiceId: payment.invoiceId,
        amount: refundAmount,
        currency: payment.currency,
        method: 'BALANCE',
        status: 'REFUNDED',
        provider: 'BALANCE',
        metadata: {
          originalPaymentId: payment.id,
          reason: request.reason,
          type: 'refund',
        },
      },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'REFUNDED' },
    });

    return {
      refundId: refund.id,
      status: 'refunded',
      rawResponse: refund,
    };
  }

  async handleWebhook(payload: WebhookPayload): Promise<ProcessedWebhookResult> {
    return { paymentId: '', status: 'pending', action: 'ignored' };
  }

  constructWebhookEvent(_rawBody: string | Buffer, _signature: string): WebhookPayload {
    throw new Error('Balance provider does not support webhooks');
  }
}