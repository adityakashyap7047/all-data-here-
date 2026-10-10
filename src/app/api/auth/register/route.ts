import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { sendTemplatedEmail, emailTemplates } from '@/lib/email';
import { generateVerificationToken } from '@/lib/auth/utils/tokens';
import { rateLimit } from '@/lib/auth/utils/rate-limit';
import { validatePasswordStrength } from '@/lib/utils/security';

export const dynamic = 'force-dynamic';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request, 'register', 5, 60 * 60 * 1000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many registration attempts. Please try again later.' } },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: { code: 'WEAK_PASSWORD', message: passwordValidation.errors.join('; ') } },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      await prisma.auditLog.create({
        data: {
          action: 'REGISTRATION_ATTEMPT_EXISTING_EMAIL',
          entity: 'User',
          entityId: existingUser.id,
          newData: { email: normalizedEmail },
        },
      });

      // Return identical success response to prevent email enumeration
      return NextResponse.json(
        { message: 'Registration successful. Please check your email to verify your account.' },
        { status: 201 }
      );
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role: 'CUSTOMER',
      },
    });

    const token = await generateVerificationToken(user.id, normalizedEmail);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
    const verifyUrl = `${appUrl}/verify-email?token=${token}`;
    await sendTemplatedEmail(normalizedEmail, 'Verify your NOTIXCLOUD account', emailTemplates.verifyEmail(verifyUrl, name));

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        entity: 'User',
        entityId: user.id,
      },
    });

    return NextResponse.json(
      {
        message: 'Registration successful. Please check your email to verify your account.',
        user: { id: user.id, email: user.email, name: user.name },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An error occurred during registration.' } },
      { status: 500 }
    );
  }
}