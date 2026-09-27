import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { PaymentService, initializePaymentProviders } from '@/lib/payments';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createPaymentSchema = z.object({
  orderId: z.string().cuid(),
  method: z.enum(['credit_card', 'paypal', 'crypto', 'bank_transfer', 'balance']),
  provider: z.enum(['stripe', 'paypal', 'coinbase', 'manual', 'balance']),
  returnUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export async function POST(request: Request) {
  await initializePaymentProviders();

  const { user, error } = await requirePermission('orders:write');
  if (error) return error;

  try {
    const body = await request.json();
    const data = createPaymentSchema.parse(body);

    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { user: true, items: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      );
    }

    if (order.userId !== user.id && !['SUPER_ADMIN', 'ADMIN', 'BILLING'].includes(user.role)) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Not authorized to pay for this order' } },
        { status: 403 }
      );
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: `Order is not in pending status: ${order.status}` } },
        { status: 409 }
      );
    }

    const idempotencyKey = PaymentService.generateIdempotencyKey(order.id);

    const session = await PaymentService.createOrderPayment({
      orderId: order.id,
      amount: Number(order.total),
      currency: order.currency,
      method: data.method,
      provider: data.provider,
      returnUrl: data.returnUrl,
      cancelUrl: data.cancelUrl,
      idempotencyKey,
    });

    return NextResponse.json({
      sessionId: session.sessionId,
      paymentId: session.paymentId,
      providerPaymentId: session.providerPaymentId,
      status: session.status,
      clientToken: session.clientToken,
      redirectUrl: session.redirectUrl,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create payment session' } },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await initializePaymentProviders();

  const { user, error } = await requirePermission('payments:read');
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    const orderId = searchParams.get('orderId');

    if (!paymentId && !orderId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'paymentId or orderId required' } },
        { status: 400 }
      );
    }

    const where = paymentId ? { id: paymentId } : { orderId: orderId! };

    const payment = await prisma.payment.findFirst({
      where,
      include: {
        order: { select: { id: true, orderNumber: true, status: true, total: true, currency: true } },
        invoice: { select: { id: true, invoiceNumber: true, status: true } },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Payment not found' } },
        { status: 404 }
      );
    }

    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'BILLING', 'SUPPORT'].includes(user.role);
    if (payment.userId !== user.id && !isAdmin) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Not authorized to view this payment' } },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: payment.id,
      amount: Number(payment.amount),
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      provider: payment.provider,
      transactionId: payment.transactionId,
      providerData: payment.providerData,
      metadata: payment.metadata,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
      order: payment.order,
      invoice: payment.invoice,
    });
  } catch (error) {
    console.error('Get payment error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch payment' } },
      { status: 500 }
    );
  }
}