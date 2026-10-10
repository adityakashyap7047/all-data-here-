import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { sendTemplatedEmail, emailTemplates } from '@/lib/email';
import { generatePasswordResetToken } from '@/lib/auth/utils/tokens';
import { rateLimit } from '@/lib/auth/utils/rate-limit';

export const dynamic = 'force-dynamic';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request, 'forgot-password', 3, 60 * 60 * 1000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      await prisma.auditLog.create({
        data: {
          action: 'PASSWORD_RESET_ATTEMPT_UNKNOWN_EMAIL',
          entity: 'User',
          newData: { email: normalizedEmail },
        },
      });
      return NextResponse.json(
        { message: 'If an account exists, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: { code: 'OAUTH_ACCOUNT', message: 'This account uses OAuth. Please sign in with your OAuth provider.' } },
        { status: 400 }
      );
    }

    const token = await generatePasswordResetToken(normalizedEmail);
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    await sendTemplatedEmail(normalizedEmail, 'Reset your NOTIXCLOUD password', emailTemplates.passwordReset(resetUrl, user.name || 'User'));

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        entity: 'User',
        entityId: user.id,
      },
    });

    return NextResponse.json(
      { message: 'If an account exists, a password reset link has been sent.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An error occurred.' } },
      { status: 500 }
    );
  }
}