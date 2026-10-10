import { NextRequest, NextResponse } from 'next/server';
import { verifyNeonToken, type NeonUser } from '@/lib/neon-auth';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const callbackUrl = searchParams.get('callback_url') || '/dashboard';

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=missing_token', request.url));
  }

  const neonUser = await verifyNeonToken(token);
  if (!neonUser) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
  }

  const dbUser = await prisma.user.upsert({
    where: { email: neonUser.email },
    update: {
      emailVerified: neonUser.email_verified ? new Date() : null,
      name: neonUser.name ?? undefined,
      image: neonUser.picture ?? undefined,
      role: (neonUser.role as 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT' | 'BILLING' | 'API') ?? 'CUSTOMER',
      twoFactorEnabled: neonUser.two_factor_enabled ?? false,
    },
    create: {
      email: neonUser.email,
      emailVerified: neonUser.email_verified ? new Date() : null,
      name: neonUser.name,
      image: neonUser.picture,
      role: (neonUser.role as 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT' | 'BILLING' | 'API') ?? 'CUSTOMER',
      twoFactorEnabled: neonUser.two_factor_enabled ?? false,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: dbUser.id,
      action: 'USER_SIGNIN',
      entity: 'User',
      entityId: dbUser.id,
      newData: { provider: 'neon', email: neonUser.email },
    },
  });

  const cookieStore = await cookies();
  cookieStore.set('neon_auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  const redirectUrl = new URL(callbackUrl, request.url);
  return NextResponse.redirect(redirectUrl);
}