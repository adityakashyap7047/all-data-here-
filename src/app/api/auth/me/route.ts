import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getNeonUserFromCookie, verifyNeonToken } from '@/lib/neon-auth';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const neonUser = await getNeonUserFromCookie(request);

    let userId: string | null = null;
    let userEmail: string | null = null;
    let userRole = 'CUSTOMER';
    let userTwoFactorEnabled = false;

    if (neonUser) {
      userEmail = neonUser.email;
      userRole = (neonUser.role as string) ?? 'CUSTOMER';
      userTwoFactorEnabled = neonUser.two_factor_enabled ?? false;

      const dbUser = await prisma.user.findUnique({
        where: { email: neonUser.email },
        select: { id: true },
      });
      userId = dbUser?.id ?? null;
    } else {
      const session = await auth();
      if (session?.user?.id) {
        userId = session.user.id;
      }
    }

    if (!userId && userEmail) {
      const dbUser = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true },
      });
      userId = dbUser?.id ?? null;
    }

    if (!userId) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        twoFactorEnabled: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An error occurred.' } },
      { status: 500 }
    );
  }
}