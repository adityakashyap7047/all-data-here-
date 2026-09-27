import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const settingsQuerySchema = z.object({
  category: z.string().optional(),
});

export async function GET(request: Request) {
  const { error } = await requirePermission('settings:read');
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const params = settingsQuerySchema.parse(Object.fromEntries(searchParams));

    const where = params.category ? { category: params.category } : {};

    const settings = await prisma.setting.findMany({
      where,
      orderBy: { category: 'asc' },
    });

    const grouped = settings.reduce((acc: any, setting) => {
      if (!acc[setting.category]) acc[setting.category] = [];
      acc[setting.category].push(setting);
      return acc;
    }, {});

    return NextResponse.json(grouped);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch settings' } },
      { status: 500 }
    );
  }
}

const updateSettingsSchema = z.object({
  category: z.string(),
  settings: z.record(z.any()),
});

export async function POST(request: Request) {
  const { user, error } = await requirePermission('settings:write');
  if (error) return error;

  try {
    const body = await request.json();
    const data = updateSettingsSchema.parse(body);

    const updates = Object.entries(data.settings).map(([key, value]) => {
      const jsonValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      return prisma.setting.upsert({
        where: { key },
        create: { key, value: jsonValue, category: data.category },
        update: { value: jsonValue },
      });
    });

    await prisma.$transaction(updates);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'SETTINGS_UPDATED',
        entity: 'Setting',
        entityId: data.category,
        newData: { category: data.category, settings: data.settings },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update settings' } },
      { status: 500 }
    );
  }
}