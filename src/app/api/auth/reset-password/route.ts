import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyToken, consumeVerificationToken } from '@/lib/auth/utils/tokens';
import { rateLimit } from '@/lib/auth/utils/rate-limit';
import { validatePasswordStrength } from '@/lib/utils/security';

export const dynamic = 'force-dynamic';

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request, 'reset-password', 5, 60 * 60 * 1000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: { code: 'WEAK_PASSWORD', message: passwordValidation.errors.join('; ') } },
        { status: 400 }
      );
    }

    const verificationResult = await verifyToken(token);
    if (!verificationResult) {
      return NextResponse.json(
        { error: { code: 'INVALID_TOKEN', message: 'Invalid or expired reset token.' } },
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

    const passwordHash = await hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    await consumeVerificationToken(token);

    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET',
        entity: 'User',
        entityId: user.id,
      },
    });

    return NextResponse.json(
      { message: 'Password has been reset successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An error occurred.' } },
      { status: 500 }
    );
  }
}