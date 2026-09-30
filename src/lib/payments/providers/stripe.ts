import Stripe from 'stripe';
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
} from '../types';
import { BasePaymentProvider } from '../provider';

export class StripePaymentProvider extends BasePaymentProvider implements PaymentProvider {
  readonly name: PaymentProviderType = 'stripe';
  readonly supportedMethods: PaymentMethodType[] = ['credit_card'];
  readonly supportsRefunds = true;
  readonly supportsWebhooks = true;

  private stripe: Stripe;

  constructor(config: PaymentProviderConfig) {
    super(config);
    this.stripe = new Stripe(config.secretKey || config.apiKey, {
      apiVersion: '2026-08-26.dahlia',
      typescript: true,
    });
  }

  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    const { amount, currency, metadata, idempotencyKey } = request;

    const existing = await this.checkIdempotency(idempotencyKey);
    if (existing.exists) {
      const payment = await this.stripe.paymentIntents.retrieve(existing.paymentId!);
      return this.mapPaymentIntentToResponse(payment);
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        ...metadata,
        idempotencyKey,
      },
    }, {
      idempotencyKey,
    });

    this.storeIdempotencyKey(idempotencyKey);

    return {
      paymentId: idempotencyKey,
      providerPaymentId: paymentIntent.id,
      status: this.mapProviderStatusToInternal(paymentIntent.status),
      clientToken: paymentIntent.client_secret || undefined,
      rawResponse: paymentIntent,
    };
  }

  async verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(request.providerPaymentId);
    return {
      status: this.mapProviderStatusToInternal(paymentIntent.status),
      paidAt: paymentIntent.status === 'succeeded' ? new Date() : undefined,
      rawResponse: paymentIntent,
    };
  }

  async refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResponse> {
    const payment = await prisma.payment.findUnique({
      where: { id: request.paymentId },
      select: { providerData: true },
    });

    if (!payment?.providerData) {
      throw new Error('Payment not found or missing provider data');
    }

    const providerPaymentId = (payment.providerData as any).id;
    const refund = await this.stripe.refunds.create({
      payment_intent: providerPaymentId,
      amount: request.amount ? Math.round(request.amount * 100) : undefined,
      reason: request.reason || 'requested_by_customer',
      metadata: { internalPaymentId: request.paymentId },
    });

    return {
      refundId: refund.id,
      status: this.mapProviderStatusToInternal(refund.status || 'succeeded'),
      rawResponse: refund,
    };
  }

  async handleWebhook(payload: WebhookPayload): Promise<ProcessedWebhookResult> {
    const event = payload.rawPayload as Stripe.Event;

    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const idempotencyKey = paymentIntent.metadata?.idempotencyKey;

        if (!idempotencyKey) {
          return { paymentId: '', status: 'pending', action: 'ignored' };
        }

        const payment = await prisma.payment.findFirst({
          where: { metadata: { path: ['idempotencyKey'], equals: idempotencyKey } },
          select: { id: true },
        });

        if (!payment) {
          return { paymentId: '', status: 'pending', action: 'ignored' };
        }

        const status = this.mapProviderStatusToInternal(paymentIntent.status);
        await this.recordPaymentAttempt(payment.id, 'stripe', paymentIntent.id, status, paymentIntent);

        return {
          paymentId: payment.id,
          status,
          action: status === 'completed' ? 'updated' : 'updated',
          metadata: { eventType: event.type },
        };
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        const payment = await prisma.payment.findFirst({
          where: { providerData: { path: ['id'], equals: paymentIntentId } },
          select: { id: true },
        });

        if (!payment) {
          return { paymentId: '', status: 'pending', action: 'ignored' };
        }

        await this.recordPaymentAttempt(payment.id, 'stripe', paymentIntentId, 'refunded', charge);

        return {
          paymentId: payment.id,
          status: 'refunded',
          action: 'refunded',
        };
      }

      default:
        return { paymentId: '', status: 'pending', action: 'ignored' };
    }
  }

  constructWebhookEvent(rawBody: string | Buffer, signature: string): WebhookPayload {
    if (!this.config.webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, this.config.webhookSecret);
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err}`);
    }

    return {
      provider: 'stripe',
      eventType: event.type,
      providerEventId: event.id,
      rawPayload: event,
      headers: {},
      receivedAt: new Date(),
    };
  }

  private mapPaymentIntentToResponse(paymentIntent: Stripe.PaymentIntent): CreatePaymentResponse {
    return {
      paymentId: paymentIntent.metadata?.idempotencyKey || paymentIntent.id,
      providerPaymentId: paymentIntent.id,
      status: this.mapProviderStatusToInternal(paymentIntent.status),
      clientToken: paymentIntent.client_secret || undefined,
      rawResponse: paymentIntent,
    };
  }
}