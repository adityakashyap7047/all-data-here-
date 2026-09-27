import { PaymentService, initializePaymentProviders } from '@/lib/payments';
import { NextResponse } from 'next/server';
import { logAuditEvent } from '@/lib/utils/security';

export async function POST(request: Request) {
  await initializePaymentProviders();

  try {
    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      await logAuditEvent(null, 'WEBHOOK_MISSING_SIGNATURE', 'Payment', null, null, { provider: 'stripe' }, request);
      return NextResponse.json(
        { error: { code: 'MISSING_SIGNATURE', message: 'Stripe signature header missing' } },
        { status: 400 }
      );
    }

    await PaymentService.handleWebhook('stripe', rawBody, signature);

    await logAuditEvent(null, 'WEBHOOK_PROCESSED', 'Payment', null, null, { provider: 'stripe' }, request);

    return NextResponse.json({ received: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('signature') || errorMessage.includes('verification')) {
      await logAuditEvent(null, 'WEBHOOK_SIGNATURE_FAILED', 'Payment', null, null, { provider: 'stripe', error: errorMessage }, request);
      return NextResponse.json(
        { error: { code: 'INVALID_SIGNATURE', message: 'Webhook signature verification failed' } },
        { status: 400 }
      );
    }

    console.error('Stripe webhook error:', error);
    await logAuditEvent(null, 'WEBHOOK_ERROR', 'Payment', null, null, { provider: 'stripe', error: errorMessage }, request);
    return NextResponse.json(
      { error: { code: 'WEBHOOK_ERROR', message: 'Webhook processing failed' } },
      { status: 500 }
    );
  }
}