import { auth as nextAuth } from '@/lib/auth';
import { getNeonUserFromRequest, getNeonUserFromCookie, type NeonUser } from '@/lib/neon-auth';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

type ExtendedNeonUser = NeonUser & { id: string; role: string; twoFactorEnabled: boolean };

export async function getSession(): Promise<{ user: ExtendedNeonUser } | null> {
  const cookieStore = await cookies();
  const request = new Request('', { headers: { cookie: cookieStore.toString() } });

  const neonUser = await getNeonUserFromCookie(request);
  if (neonUser) {
    const dbUser = await prisma.user.findUnique({
      where: { email: neonUser.email },
      select: { id: true, role: true, twoFactorEnabled: true },
    });

    return {
      user: {
        ...neonUser,
        id: dbUser?.id ?? neonUser.sub,
        role: dbUser?.role ?? 'CUSTOMER',
        twoFactorEnabled: dbUser?.twoFactorEnabled ?? false,
      } as ExtendedNeonUser,
    };
  }

  const nextAuthSession = await nextAuth();
  if (nextAuthSession?.user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: nextAuthSession.user.id },
      select: { emailVerified: true },
    });

    return {
      user: {
        sub: nextAuthSession.user.id,
        email: nextAuthSession.user.email!,
        email_verified: !!dbUser?.emailVerified,
        name: nextAuthSession.user.name ?? undefined,
        picture: nextAuthSession.user.image ?? undefined,
        role: nextAuthSession.user.role,
        two_factor_enabled: nextAuthSession.user.twoFactorEnabled,
        id: nextAuthSession.user.id,
        twoFactorEnabled: nextAuthSession.user.twoFactorEnabled,
      } as ExtendedNeonUser,
    };
  }

  return null;
}

export async function getServerSession(): Promise<{ user: ExtendedNeonUser } | null> {
  return getSession();
}

export { nextAuth as auth, nextAuth as signIn, nextAuth as signOut };
export { handlers } from '@/lib/auth';