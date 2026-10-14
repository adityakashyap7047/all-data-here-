import { requirePermission } from '@/lib/auth/utils/permissions';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateSortField, validateOrder } from '@/lib/utils/security';
import { encryptPrivateKey, validatePrivateKeyFormat } from '@/lib/ssh/encryption';

const nodeQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  status: z.string().optional(),
  nodeType: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(request: Request) {
  const { user, error } = await requirePermission('vps:read');
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const params = nodeQuerySchema.parse(Object.fromEntries(searchParams));

    const page = params.page;
    const limit = params.limit;
    const skip = (page - 1) * limit;
    const status = params.status;
    const nodeType = params.nodeType;
    const search = params.search || '';
    const sort = validateSortField('vpsNode', params.sort);
    const order = validateOrder(params.order);

    const where = {
      ...(status && { status: status as any }),
      ...(nodeType && { nodeType: nodeType as any }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { hostname: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [nodes, total] = await Promise.all([
      prisma.vPSNode.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          _count: { select: { servers: true, metrics: true } },
          metrics: { orderBy: { timestamp: 'desc' }, take: 1 },
        },
      }),
      prisma.vPSNode.count({ where }),
    ]);

    return NextResponse.json({
      nodes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Get VPS nodes error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch VPS nodes' } },
      { status: 500 }
    );
  }
}

const createNodeSchema = z.object({
  name: z.string().min(1).max(100),
  hostname: z.string().min(1).max(255),
  sshPort: z.coerce.number().int().min(1).max(65535).default(22),
  sshUsername: z.string().min(1).max(64),
  authType: z.enum(['SSH_KEY', 'AGENT']).default('SSH_KEY'),
  sshPrivateKey: z.string().optional(),
  sshPublicKey: z.string().optional(),
  hostKeyFingerprint: z.string().optional(),
  nodeType: z.enum(['PRODUCTION', 'DEVELOPMENT']).default('PRODUCTION'),
});

export async function POST(request: Request) {
  const { user, error } = await requirePermission('vps:write');
  if (error) return error;

  try {
    const body = await request.json();
    const data = createNodeSchema.parse(body);

    if (data.authType === 'SSH_KEY' && !data.sshPrivateKey) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'SSH private key is required for key-based authentication' } },
        { status: 400 }
      );
    }

    // Validate SSH private key format before encryption
    if (data.sshPrivateKey) {
      const keyValidation = validatePrivateKeyFormat(data.sshPrivateKey);
      if (!keyValidation.valid) {
        return NextResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: keyValidation.error } },
          { status: 400 }
        );
      }
    }

    const existingNode = await prisma.vPSNode.findFirst({
      where: { hostname: data.hostname, sshPort: data.sshPort },
    });

    if (existingNode) {
      return NextResponse.json(
        { error: { code: 'CONFLICT', message: 'A node with this hostname and port already exists' } },
        { status: 409 }
      );
    }

    const node = await prisma.vPSNode.create({
      data: {
        name: data.name,
        hostname: data.hostname,
        sshPort: data.sshPort,
        sshUsername: data.sshUsername,
        authType: data.authType,
        sshPrivateKey: data.sshPrivateKey ? await encryptPrivateKey(data.sshPrivateKey, process.env.SSH_MASTER_KEY || 'default-master-key-change-in-production') : null,
        sshPublicKey: data.sshPublicKey || null,
        hostKeyFingerprint: data.hostKeyFingerprint || null,
        nodeType: data.nodeType,
        status: 'UNREACHABLE',
        createdBy: user.id,
      },
    });

    await prisma.vPSNodeConnectionLog.create({
      data: {
        nodeId: node.id,
        eventType: 'NODE_REGISTERED',
        success: true,
        message: 'Node registered via admin panel',
        details: { nodeType: data.nodeType, authType: data.authType },
        createdBy: user.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'VPS_NODE_CREATED',
        entity: 'VPSNode',
        entityId: node.id,
        newData: { name: node.name, hostname: node.hostname, nodeType: data.nodeType },
      },
    });

    return NextResponse.json(node, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Create VPS node error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create VPS node' } },
      { status: 500 }
    );
  }
}