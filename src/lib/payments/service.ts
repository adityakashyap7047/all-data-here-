import { prisma } from '@/lib/prisma';
import { PaymentProviderRegistry } from './provider';
import type {
  PaymentProviderType,
  PaymentMethodType,
  PaymentStatus,
  OrderPaymentData,
  PaymentSession,
  CreatePaymentRequest,
  PaymentMetadata,
} from './types';
import { generateOrderNumber, createIdempotencyKey } from '@/lib/utils';
import { checkAndSetIdempotency } from '@/lib/utils/security';

export class PaymentService {
  static async createOrderPayment(data: OrderPaymentData): Promise<PaymentSession> {
    const provider = PaymentProviderRegistry.get(data.provider);
    if (!provider) {
      throw new Error(`Payment provider ${data.provider} not found`);
    }

    if (!provider.supportedMethods.includes(data.method)) {
      throw new Error(`Payment method ${data.method} not supported by provider ${data.provider}`);
    }

    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { user: true, items: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new Error(`Order is not in pending status: ${order.status}`);
    }

    const idempotencyKey = data.idempotencyKey || createIdempotencyKey('payment', order.userId, order.id);
    
    const { exists } = await checkAndSetIdempotency(idempotencyKey, 3600);
    if (exists) {
      const existingPayment = await prisma.payment.findFirst({
        where: {
          metadata: {
            path: ['idempotencyKey'],
            equals: idempotencyKey,
          },
        },
      });

      if (existingPayment) {
        return this.mapToSession(existingPayment);
      }
    }

    const paymentRequest: CreatePaymentRequest = {
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      provider: data.provider,
      metadata: {
        orderId: data.orderId,
        userId: order.userId,
        description: `Order ${order.orderNumber}`,
        returnUrl: data.returnUrl,
        cancelUrl: data.cancelUrl,
        idempotencyKey,
      },
      idempotencyKey,
    };

    const response = await provider.createPayment(paymentRequest);

    const payment = await prisma.payment.create({
      data: {
        userId: order.userId,
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
        method: data.method.toUpperCase() as any,
        status: response.status.toUpperCase() as any,
        provider: data.provider.toUpperCase() as any,
        providerData: response.rawResponse as any,
        metadata: paymentRequest.metadata as any,
        transactionId: response.providerPaymentId,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: order.userId,
        action: 'PAYMENT_INITIATED',
        entity: 'Payment',
        entityId: payment.id,
        newData: {
          amount: data.amount,
          currency: data.currency,
          method: data.method,
          provider: data.provider,
          providerPaymentId: response.providerPaymentId,
        },
      },
    });

    return {
      sessionId: payment.id,
      orderId: data.orderId,
      paymentId: payment.id,
      providerPaymentId: response.providerPaymentId,
      status: response.status,
      clientToken: response.clientToken,
      redirectUrl: response.redirectUrl,
      expiresAt: response.expiresAt || new Date(Date.now() + 30 * 60 * 1000),
      createdAt: payment.createdAt,
    };
  }

  static async verifyPayment(paymentId: string, provider: PaymentProviderType): Promise<PaymentStatus> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true, invoice: true },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    const providerInstance = PaymentProviderRegistry.get(provider);
    if (!providerInstance) {
      throw new Error(`Payment provider ${provider} not found`);
    }

    if (payment.status === 'COMPLETED') {
      return 'completed';
    }

    const verification = await providerInstance.verifyPayment({
      providerPaymentId: payment.transactionId || payment.providerData?.id as string,
      paymentId: payment.id,
    });

    if (verification.status !== payment.status.toLowerCase()) {
      await this.updatePaymentStatus(payment.id, verification.status, verification.rawResponse);

      if (verification.status === 'completed') {
        await this.handleSuccessfulPayment(payment);
      }
    }

    return verification.status;
  }

  static async handleWebhook(
    provider: PaymentProviderType,
    rawBody: string | Buffer,
    signature: string
  ): Promise<void> {
    const providerInstance = PaymentProviderRegistry.get(provider);
    if (!providerInstance) {
      throw new Error(`Payment provider ${provider} not found`);
    }

    if (!providerInstance.supportsWebhooks) {
      throw new Error(`Provider ${provider} does not support webhooks`);
    }

    const webhookPayload = providerInstance.constructWebhookEvent(rawBody, signature);

    const existingEvent = await prisma.auditLog.findFirst({
      where: {
        action: 'WEBHOOK_RECEIVED',
        entity: 'Payment',
        metadata: {
          path: ['providerEventId'],
          equals: webhookPayload.providerEventId,
        },
      },
    });

    if (existingEvent) {
      return;
    }

    const result = await providerInstance.handleWebhook(webhookPayload);

    await prisma.auditLog.create({
      data: {
        action: 'WEBHOOK_RECEIVED',
        entity: 'Payment',
        entityId: result.paymentId,
        metadata: {
          provider: webhookPayload.provider,
          eventType: webhookPayload.eventType,
          providerEventId: webhookPayload.providerEventId,
          action: result.action,
        },
      },
    });

    if (result.paymentId && result.action !== 'ignored') {
      await this.updatePaymentStatus(result.paymentId, result.status, result.metadata);
      if (result.status === 'completed') {
        const payment = await prisma.payment.findUnique({ where: { id: result.paymentId } });
        if (payment) {
          await this.handleSuccessfulPayment(payment);
        }
      }
    }
  }

  static async refundPayment(
    paymentId: string,
    provider: PaymentProviderType,
    amount?: number,
    reason?: string
  ): Promise<void> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true, invoice: true },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'COMPLETED') {
      throw new Error('Can only refund completed payments');
    }

    const refundAmount = amount ? Number(amount) : Number(payment.amount);
    if (refundAmount > Number(payment.amount)) {
      throw new Error('Refund amount cannot exceed original payment amount');
    }

    const providerInstance = PaymentProviderRegistry.get(provider);
    if (!providerInstance?.supportsRefunds) {
      throw new Error(`Provider ${provider} does not support refunds`);
    }

    const refund = await providerInstance.refundPayment!({
      paymentId,
      amount: refundAmount,
      reason,
    });

    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'REFUNDED' },
    });

    await prisma.auditLog.create({
      data: {
        userId: payment.userId,
        action: 'PAYMENT_REFUNDED',
        entity: 'Payment',
        entityId: paymentId,
        oldData: { amount: payment.amount, status: payment.status },
        newData: { refundId: refund.refundId, amount: refundAmount },
      },
    });

    if (payment.order) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'REFUNDED' },
      });
    }
  }

  private static async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    rawResponse?: unknown
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

  private static async handleSuccessfulPayment(payment: any): Promise<void> {
    const completedOrder = await prisma.order.findUnique({
      where: { id: payment.orderId },
    });

    if (completedOrder && completedOrder.status !== 'COMPLETED') {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: payment.userId,
          action: 'ORDER_COMPLETED',
          entity: 'Order',
          entityId: payment.orderId,
          newData: { status: 'COMPLETED', paidAt: new Date() },
        },
      });

      const vpsItems = completedOrder.items.filter((item: any) => item.type === 'VPS_PLAN');
      if (vpsItems.length > 0) {
        const existingVps = await prisma.vPSInstance.findFirst({
          where: {
            userId: completedOrder.userId,
            planId: { in: vpsItems.map((i: any) => i.metadata?.planId).filter(Boolean) },
            status: { in: ['PENDING', 'PROVISIONING', 'RUNNING'] },
          },
        });

        if (!existingVps) {
          await this.provisionVPSForOrder(completedOrder.id);
        }
      }
    }

    if (payment.invoiceId) {
      await prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });
    }
  }

  private static async provisionVPSForOrder(orderId: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true },
    });

    if (!order) return;

    for (const item of order.items) {
      if (item.type === 'VPS_PLAN') {
        const planId = item.metadata?.planId as string;
        if (!planId) continue;

        const plan = await prisma.vPSPlan.findUnique({ where: { id: planId } });
        if (!plan) continue;

        const existingVps = await prisma.vPSInstance.findFirst({
          where: {
            userId: order.userId,
            planId: plan.id,
            status: { in: ['PENDING', 'PROVISIONING', 'RUNNING'] },
          },
        });

        if (existingVps) continue;

        const hostname = `vps-${order.userId.slice(-8)}-${Date.now().toString(36)}`;
        const rootPassword = Array.from(crypto.getRandomValues(new Uint8Array(16)))
          .map(b => b.toString(16).padStart(2, '0')).join('');

        await prisma.vPSInstance.create({
          data: {
            userId: order.userId,
            planId: plan.id,
            hostname,
            ipv4Address: `10.0.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
            rootPassword,
            osTemplate: 'ubuntu-22.04',
            status: 'PROVISIONING',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
  }

  private static mapToSession(payment: any): PaymentSession {
    return {
      sessionId: payment.id,
      orderId: payment.orderId!,
      paymentId: payment.id,
      providerPaymentId: payment.transactionId || payment.providerData?.id,
      status: payment.status.toLowerCase() as PaymentStatus,
      clientToken: payment.providerData?.client_secret,
      redirectUrl: payment.providerData?.redirect_url,
      expiresAt: new Date(payment.createdAt.getTime() + 30 * 60 * 1000),
      createdAt: payment.createdAt,
    };
  }

  static generateIdempotencyKey(orderId: string): string {
    return `order_${orderId}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }
}

export async function initializePaymentProviders(): Promise<void> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (stripeKey) {
    const { StripePaymentProvider } = await import('./providers/stripe');
    PaymentProviderRegistry.register(new StripePaymentProvider({
      apiKey: stripeKey,
      secretKey: stripeKey,
      webhookSecret: stripeWebhookSecret,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    }));
  }

  const { ManualPaymentProvider } = await import('./providers/manual');
  PaymentProviderRegistry.register(new ManualPaymentProvider({
    apiKey: 'manual',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  }));

  const { BalancePaymentProvider } = await import('./providers/manual');
  PaymentProviderRegistry.register(new BalancePaymentProvider({
    apiKey: 'balance',
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  }));
}