import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Discord from 'next-auth/providers/discord';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { checkFailedLoginAttempts, recordFailedLogin, clearFailedLogins } from '@/lib/utils/security';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const normalizedEmail = email.toLowerCase();

        const { blocked, attempts } = await checkFailedLoginAttempts(normalizedEmail);
        if (blocked) {
          throw new Error('Too many failed attempts. Please try again later.');
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user?.passwordHash) {
          await recordFailedLogin(normalizedEmail);
          return null;
        }

        const valid = await compare(password, user.passwordHash);
        if (!valid) {
          await recordFailedLogin(normalizedEmail);
          return null;
        }

        await clearFailedLogins(normalizedEmail);

        if (!user.emailVerified) {
          throw new Error('Please verify your email before signing in.');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, twoFactorEnabled: true },
        });
        session.user.role = dbUser?.role ?? 'CUSTOMER';
        session.user.twoFactorEnabled = dbUser?.twoFactorEnabled ?? false;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'credentials') return true;
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });
      if (existingUser && !existingUser.emailVerified) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { emailVerified: new Date() },
        });
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'USER_CREATED',
          entity: 'User',
          entityId: user.id,
        },
      });
    },
    async linkAccount({ user, account }) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'ACCOUNT_LINKED',
          entity: 'Account',
          entityId: account.providerAccountId,
          newData: { provider: account.provider },
        },
      });
    },
  },
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
});

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      twoFactorEnabled: boolean;
    };
  }
  interface User {
    role: string;
    twoFactorEnabled: boolean;
  }
}

declare module 'next-auth' {
  interface JWT {
    role: string;
    twoFactorEnabled: boolean;
  }
}