import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const registerSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(12),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid registration data', errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Get default customer role
    const customerRole = await prisma.role.findUnique({
      where: { name: 'CUSTOMER' },
    });

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        status: 'PENDING_VERIFICATION',
        roles: customerRole ? {
          create: {
            roleId: customerRole.id,
            assignedBy: 'system',
          },
        } : undefined,
      },
    });

    // Create email verification token (in production, send email)
    const verificationToken = crypto.randomUUID();
    // await sendVerificationEmail(user.email, verificationToken);

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        resourceType: 'User',
        resourceId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        severity: 'INFO',
        newValues: { email: user.email, firstName: user.firstName, lastName: user.lastName },
      },
    });

    // Return user data (without password)
    const { passwordHash: _, twoFactorSecret: __, backupCodes: ___, ...userWithoutSecrets } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutSecrets,
      message: 'Account created successfully. Please check your email to verify your account.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}