import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyToken, consumeVerificationToken } from '@/lib/auth/utils/tokens';
import { rateLimit } from '@/lib/auth/utils/rate-limit';

const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request, 'verify-email', 10, 60 * 60 * 1000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = verifyEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } },
        { status: 400 }
      );
    }

    const { token } = parsed.data;

    const verificationResult = await verifyToken(token);
    if (!verificationResult) {
      return NextResponse.json(
        { error: { code: 'INVALID_TOKEN', message: 'Invalid or expired verification token.' } },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: verificationResult.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found.' } },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email already verified.' },
        { status: 200 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    await consumeVerificationToken(token);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'EMAIL_VERIFIED',
        entity: 'User',
        entityId: user.id,
      },
    });

    return NextResponse.json(
      { message: 'Email verified successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An error occurred.' } },
      { status: 500 }
    );
  }
}