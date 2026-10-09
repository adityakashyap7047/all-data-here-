import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      // Don't reveal if user exists
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { message: 'Account is not active. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      // Increment failed login attempts
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: { increment: 1 },
          lockedUntil: user.failedLoginAttempts >= 4 ? new Date(Date.now() + 15 * 60 * 1000) : null,
        },
      });
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Reset failed attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    // Create session (in production, use proper JWT/session management)
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + (result.data.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000));

    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        expiresAt,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        resourceType: 'User',
        resourceId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        severity: 'INFO',
      },
    });

    // Return user data (without password)
    const { passwordHash: _, twoFactorSecret: __, backupCodes: ___, ...userWithoutSecrets } = user;

    const response = NextResponse.json({
      success: true,
      user: userWithoutSecrets,
    });

    // Set httpOnly cookie
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: result.data.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}