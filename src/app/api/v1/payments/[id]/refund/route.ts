import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { PaymentService, initializePaymentProviders } from '@/lib/payments';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const refundSchema = z.object({
  amount: z.number().positive().optional(),
  reason: z.string().max(500).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await initializePaymentProviders();

  const { user, error } = await requirePermission('billing:write');
  if (error) return error;

  try {
    const { id: paymentId } = await params;
    const body = await request.json();
    const data = refundSchema.parse(body);

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true, invoice: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Payment not found' } },
        { status: 404 }
      );
    }

    if (payment.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'Can only refund completed payments' } },
        { status: 409 }
      );
    }

    await PaymentService.refundPayment(paymentId, payment.provider.toLowerCase() as any, data.amount, data.reason);

    return NextResponse.json({ success: true, message: 'Refund processed' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Refund payment error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to process refund' } },
      { status: 500 }
    );
  }
}