import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { sendTemplatedEmail, emailTemplates } from '@/lib/email';
import { generateVerificationToken } from '@/lib/auth/utils/tokens';
import { rateLimit } from '@/lib/auth/utils/rate-limit';

const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request, 'resend-verification', 3, 60 * 60 * 1000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = resendVerificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists, a verification email has been sent.' },
        { status: 200 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email already verified.' },
        { status: 200 }
      );
    }

    const token = await generateVerificationToken(user.id, email);
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

    await sendTemplatedEmail(email, 'Verify your NOTIXCLOUD account', emailTemplates.verifyEmail(verifyUrl, user.name || 'User'));

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'VERIFICATION_EMAIL_RESENT',
        entity: 'User',
        entityId: user.id,
      },
    });

    return NextResponse.json(
      { message: 'If an account exists, a verification email has been sent.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An error occurred.' } },
      { status: 500 }
    );
  }
}