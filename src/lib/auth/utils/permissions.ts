import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT' | 'BILLING' | 'CUSTOMER' | 'API';

export const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  SUPPORT: 60,
  BILLING: 50,
  CUSTOMER: 10,
  API: 5,
};

export const PERMISSIONS: Record<Role, string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: [
    'users:read', 'users:write', 'users:delete',
    'vps:read', 'vps:write', 'vps:delete',
    'orders:read', 'orders:write',
    'billing:read', 'billing:write',
    'tickets:read', 'tickets:write', 'tickets:assign',
    'audit:read',
    'settings:read', 'settings:write',
  ],
  SUPPORT: [
    'users:read',
    'vps:read',
    'tickets:read', 'tickets:write', 'tickets:assign',
  ],
  BILLING: [
    'users:read',
    'orders:read', 'orders:write',
    'billing:read', 'billing:write',
    'invoices:read', 'invoices:write',
    'payments:read', 'payments:write',
  ],
  CUSTOMER: [
    'vps:read:self', 'vps:write:self',
    'orders:read:self',
    'billing:read:self',
    'tickets:read:self', 'tickets:write:self',
    'profile:read', 'profile:write',
  ],
  API: [
    'vps:read', 'vps:write',
    'metrics:read',
  ],
};

export function hasPermission(userRole: Role, permission: string): boolean {
  const permissions = PERMISSIONS[userRole] || [];
  if (permissions.includes('*')) return true;
  return permissions.includes(permission);
}

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return { user: null, error: NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
      { status: 401 }
    ) };
  }
  return { user: session.user, error: null };
}

export async function requireRole(requiredRole: Role) {
  const session = await auth();
  if (!session?.user?.id) {
    return { user: null, error: NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
      { status: 401 }
    ) };
  }

  const userRole = session.user.role as Role;
  if (!hasRole(userRole, requiredRole)) {
    return { user: null, error: NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Insufficient permissions.' } },
      { status: 403 }
    ) };
  }

  return { user: session.user, error: null };
}

export async function requirePermission(permission: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { user: null, error: NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
      { status: 401 }
    ) };
  }

  const userRole = session.user.role as Role;
  if (!hasPermission(userRole, permission)) {
    return { user: null, error: NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Insufficient permissions.' } },
      { status: 403 }
    ) };
  }

  return { user: session.user, error: null };
}

export async function requireOwnershipOrRole(resourceUserId: string, requiredRole: Role = 'ADMIN') {
  const session = await auth();
  if (!session?.user?.id) {
    return { user: null, error: NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
      { status: 401 }
    ) };
  }

  const userRole = session.user.role as Role;
  const isOwner = session.user.id === resourceUserId;
  const hasRequiredRole = hasRole(userRole, requiredRole);

  if (!isOwner && !hasRequiredRole) {
    return { user: null, error: NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Insufficient permissions.' } },
      { status: 403 }
    ) };
  }

  return { user: session.user, error: null };
}

export async function requireTwoFactor() {
  const session = await auth();
  if (!session?.user?.id) {
    return { user: null, error: NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
      { status: 401 }
    ) };
  }

  if (!session.user.twoFactorEnabled) {
    return { user: null, error: NextResponse.json(
      { error: { code: 'TWO_FACTOR_REQUIRED', message: 'Two-factor authentication is required for this action.' } },
      { status: 403 }
    ) };
  }

  return { user: session.user, error: null };
}