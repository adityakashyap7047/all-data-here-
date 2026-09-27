import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateSortField, validateOrder } from '@/lib/utils/security';

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'BILLING', 'CUSTOMER', 'API']).optional(),
  twoFactorEnabled: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requirePermission('users:write');
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateUserSchema.parse(body);

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, twoFactorEnabled: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    const roleHierarchy: Record<string, number> = {
      SUPER_ADMIN: 100,
      ADMIN: 80,
      SUPPORT: 60,
      BILLING: 50,
      CUSTOMER: 10,
      API: 5,
    };

    if (data.role && roleHierarchy[data.role] >= roleHierarchy[currentUser?.role || 'CUSTOMER']) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Cannot assign role equal or higher than your own' } },
        { status: 403 }
      );
    }

    if (targetUser.id === user.id && data.role && data.role !== targetUser.role) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Cannot change your own role' } },
        { status: 403 }
      );
    }

    if (targetUser.id === user.id && data.twoFactorEnabled === false) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Cannot disable your own 2FA' } },
        { status: 403 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role,
        twoFactorEnabled: data.twoFactorEnabled,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_UPDATED',
        entity: 'User',
        entityId: id,
        oldData: { role: targetUser.role, twoFactorEnabled: targetUser.twoFactorEnabled },
        newData: { role: updatedUser.role, twoFactorEnabled: updatedUser.twoFactorEnabled },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update user' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requirePermission('users:delete');
  if (error) return error;

  try {
    const { id } = await params;

    if (id === user.id) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Cannot delete your own account' } },
        { status: 403 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    const roleHierarchy: Record<string, number> = {
      SUPER_ADMIN: 100,
      ADMIN: 80,
      SUPPORT: 60,
      BILLING: 50,
      CUSTOMER: 10,
      API: 5,
    };

    if (roleHierarchy[targetUser.role] >= roleHierarchy[currentUser?.role || 'CUSTOMER']) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Cannot delete user with equal or higher role' } },
        { status: 403 }
      );
    }

    await prisma.user.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_DELETED',
        entity: 'User',
        entityId: id,
        oldData: { email: targetUser.email, role: targetUser.role },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete user' } },
      { status: 500 }
    );
  }
}