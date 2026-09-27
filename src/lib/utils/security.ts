import { prisma } from '@/lib/prisma';

export const ALLOWED_SORT_FIELDS = {
  user: ['id', 'email', 'name', 'role', 'createdAt', 'updatedAt', 'emailVerified'],
  vps: ['id', 'name', 'hostname', 'status', 'planId', 'location', 'createdAt', 'expiresAt'],
  plan: ['id', 'name', 'slug', 'priceMonthly', 'sortOrder', 'createdAt'],
  order: ['id', 'orderNumber', 'status', 'total', 'createdAt', 'paidAt'],
  payment: ['id', 'amount', 'status', 'createdAt', 'completedAt'],
  invoice: ['id', 'invoiceNumber', 'status', 'total', 'dueDate', 'createdAt'],
  ticket: ['id', 'subject', 'status', 'priority', 'createdAt', 'updatedAt'],
  auditLog: ['id', 'action', 'entity', 'createdAt'],
} as const;

export type SortFieldType = keyof typeof ALLOWED_SORT_FIELDS;

export function validateSortField(entity: SortFieldType, sort: string): string {
  const allowed = ALLOWED_SORT_FIELDS[entity];
  if (allowed.includes(sort as any)) {
    return sort;
  }
  return allowed[0];
}

export function validateOrder(order: string): 'asc' | 'desc' {
  return order === 'asc' ? 'asc' : 'desc';
}

export async function logAuditEvent(
  userId: string | null,
  action: string,
  entity: string,
  entityId: string | null,
  oldData?: unknown,
  newData?: unknown,
  request?: Request
) {
  try {
    let ipAddress: string | undefined;
    let userAgent: string | undefined;

    if (request) {
      ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        undefined;
      userAgent = request.headers.get('user-agent') || undefined;
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        oldData: oldData as any,
        newData: newData as any,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Audit log failed:', error);
  }
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, `'`)
    .replace(/\//g, '&#x2F;');
}

export function generateSecureToken(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function verifyConstantTime(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export const passwordRequirements = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < passwordRequirements.minLength) {
    errors.push(`Password must be at least ${passwordRequirements.minLength} characters`);
  }
  if (passwordRequirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (passwordRequirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (passwordRequirements.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (passwordRequirements.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return { valid: errors.length === 0, errors };
}

export async function checkFailedLoginAttempts(email: string): Promise<{ blocked: boolean; attempts: number }> {
  const key = `failed_login:${email.toLowerCase()}`;
  try {
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    const attempts = await redis.get(key);
    const count = attempts ? parseInt(attempts as string, 10) : 0;
    return { blocked: count >= 5, attempts: count };
  } catch {
    return { blocked: false, attempts: 0 };
  }
}

export async function recordFailedLogin(email: string): Promise<void> {
  const key = `failed_login:${email.toLowerCase()}`;
  try {
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    const attempts = await redis.incr(key);
    if (attempts === 1) {
      await redis.expire(key, 15 * 60);
    }
  } catch {
    // Fail silently if Redis not available
  }
}

export async function clearFailedLogins(email: string): Promise<void> {
  const key = `failed_login:${email.toLowerCase()}`;
  try {
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    await redis.del(key);
  } catch {
    // Fail silently
  }
}

export function createIdempotencyKey(prefix: string, userId: string, action: string): string {
  const timestamp = Date.now();
  const random = crypto.getRandomValues(new Uint8Array(8));
  const randomStr = Array.from(random, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${userId}_${action}_${timestamp}_${randomStr}`;
}

export async function checkAndSetIdempotency(key: string, ttlSeconds = 3600): Promise<{ exists: boolean }> {
  try {
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    const exists = await redis.set(key, '1', { nx: true, ex: ttlSeconds });
    return { exists: !exists };
  } catch {
    return { exists: false };
  }
}