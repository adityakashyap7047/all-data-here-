import { randomBytes } from 'crypto';
import prisma from '@/lib/prisma';

export async function generateVerificationToken(userId: string, email: string): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.upsert({
    where: {
      identifier_token: {
        identifier: email,
        token,
      },
    },
    create: {
      identifier: email,
      token,
      expires: expiresAt,
    },
    update: {
      token,
      expires: expiresAt,
    },
  });

  return token;
}

export async function verifyToken(token: string): Promise<{ email: string } | null> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) return null;
  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return null;
  }

  return { email: verificationToken.identifier };
}

export async function consumeVerificationToken(token: string): Promise<boolean> {
  const result = await prisma.verificationToken.deleteMany({
    where: { token },
  });
  return result.count > 0;
}

export async function generatePasswordResetToken(email: string): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.verificationToken.upsert({
    where: {
      identifier_token: {
        identifier: email,
        token,
      },
    },
    create: {
      identifier: email,
      token,
      expires: expiresAt,
    },
    update: {
      token,
      expires: expiresAt,
    },
  });

  return token;
}

export async function generateApiKey(): Promise<{ key: string; prefix: string; hash: string }> {
  const prefix = 'nc_';
  const randomPart = randomBytes(24).toString('base64url');
  const key = `${prefix}${randomPart}`;
  const hash = await hashApiKey(key);
  return { key, prefix: key.slice(0, 12), hash };
}

export async function hashApiKey(key: string): Promise<string> {
  const { hash } = await import('bcryptjs');
  return hash(key, 12);
}

export async function verifyApiKey(key: string, hash: string): Promise<boolean> {
  const { compare } = await import('bcryptjs');
  return compare(key, hash);
}