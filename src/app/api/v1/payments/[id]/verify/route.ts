import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { PaymentService, initializePaymentProviders } from '@/lib/payments';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await initializePaymentProviders();

  const { user, error } = await requirePermission('payments:read');
  if (error) return error;

  try {
    const { id: paymentId } = await params;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Payment not found' } },
        { status: 404 }
      );
    }

    if (payment.userId !== user.id && !['SUPER_ADMIN', 'ADMIN', 'BILLING', 'SUPPORT'].includes(user.role)) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Not authorized to verify this payment' } },
        { status: 403 }
      );
    }

    const status = await PaymentService.verifyPayment(paymentId, payment.provider.toLowerCase() as any);

    return NextResponse.json({
      paymentId,
      status,
      orderStatus: payment.order?.status,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to verify payment' } },
      { status: 500 }
    );
  }
}