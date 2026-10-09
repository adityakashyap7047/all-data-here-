import { PrismaClient, OrderStatus, OrderItemType, SubscriptionStatus, BillingCycle, PaymentStatus, InvoiceStatus } from '@prisma/client';
import { createVPSProvider, ProvisioningContext, ServerCreateOptions } from './providers';
import { VPSProvider } from './providers/vps-provider';

const prisma = new PrismaClient();

export interface ProvisioningJob {
  orderId: string;
  orderItemId: string;
  userId: string;
  planId: string;
  locationId: string;
  serverName: string;
  hostname: string;
  idempotencyKey: string;
}

export class ProvisioningService {
  private provider: VPSProvider;

  constructor(provider?: VPSProvider) {
    this.provider = provider || createVPSProvider();
  }

  async provisionFromOrder(orderId: string): Promise<{ success: boolean; serverId?: string; error?: string }> {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          user: true,
        },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status !== OrderStatus.CONFIRMED && order.status !== OrderStatus.PROCESSING) {
        throw new Error(`Order is not in a provisionable state: ${order.status}`);
      }

      const vpsItem = order.items.find(item => item.type === OrderItemType.VPS_PLAN);
      if (!vpsItem) {
        throw new Error('No VPS plan item found in order');
      }

      if (vpsItem.subscriptionId) {
        throw new Error('Server already provisioned for this order item');
      }

      const plan = await tx.vPSPlan.findUnique({ where: { id: vpsItem.planId } });
      if (!plan) {
        throw new Error('VPS plan not found');
      }

      const location = await tx.serverLocation.findUnique({ where: { id: vpsItem.locationId } });
      if (!location) {
        throw new Error('Server location not found');
      }

      const serverName = vpsItem.serverId || `${order.user.email.split('@')[0]}-${Date.now()}`;
      const hostname = `${serverName}.notixcloud.dev`;
      const idempotencyKey = `prov-${orderId}-${vpsItem.id}`;

      await tx.orderItem.update({
        where: { id: vpsItem.id },
        data: { metadata: { ...(vpsItem.metadata as object || {}), provisioningStarted: new Date().toISOString() } },
      });

      const context: ProvisioningContext = {
        orderId: order.id,
        userId: order.userId,
        serverName,
        idempotencyKey,
      };

      const serverOptions: ServerCreateOptions = {
        name: serverName,
        hostname,
        specs: {
          cpuCores: plan.cpuCores,
          ramMb: plan.ramGb * 1024,
          storageGb: plan.storageGb,
          bandwidthTb: plan.bandwidthTb,
          ipv4Count: plan.ipv4Addresses,
          ipv6Count: plan.ipv6Addresses,
        },
        locationId: location.id,
        osTemplate: 'ubuntu-24.04',
        sshKeyIds: [],
        userData: JSON.stringify({ orderId: order.id, userId: order.userId }),
        idempotencyKey,
        orderId: order.id,
        userId: order.userId,
      };

      const result = await this.provider.provisionServer(context, serverOptions);

      if (!result.success) {
        await tx.auditLog.create({
          data: {
            userId: order.userId,
            action: 'SERVER_ACTION',
            resourceType: 'Server',
            resourceId: serverName,
            newValues: { error: result.message, errorCode: result.errorCode },
            severity: 'ERROR',
            ipAddress: 'system',
            userAgent: 'provisioning-service',
          },
        });

        return { success: false, error: result.message };
      }

      const serverId = result.serverId!;

      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.COMPLETED, completedAt: new Date() },
      });

      await tx.orderItem.update({
        where: { id: vpsItem.id },
        data: {
          serverId,
          metadata: { ...(vpsItem.metadata as object || {}), provisionedAt: new Date().toISOString(), providerServerId: result.providerServerId },
        },
      });

      const subscription = await tx.subscription.create({
        data: {
          subscriptionNumber: `SUB-${Date.now()}`,
          userId: order.userId,
          planId: plan.id,
          locationId: location.id,
          status: SubscriptionStatus.ACTIVE,
          billingCycle: BillingCycle.MONTHLY,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          priceCents: plan.monthlyPriceCents,
          currency: plan.currency,
          autoRenew: true,
          nextInvoiceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      await tx.orderItem.update({
        where: { id: vpsItem.id },
        data: { subscriptionId: subscription.id },
      });

      await tx.auditLog.create({
        data: {
          userId: order.userId,
          action: 'SERVER_ACTION',
          resourceType: 'Server',
          resourceId: serverId,
          newValues: { planId: plan.id, locationId: location.id, subscriptionId: subscription.id },
          severity: 'INFO',
          ipAddress: 'system',
          userAgent: 'provisioning-service',
        },
      });

      return { success: true, serverId };
    });
  }

  async retryFailedProvisioning(orderId: string): Promise<{ success: boolean; serverId?: string; error?: string }> {
    return this.provisionFromOrder(orderId);
  }

  async handleFailedPayment(orderId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) return;

      const vpsItem = order.items.find(item => item.type === OrderItemType.VPS_PLAN);
      if (!vpsItem || !vpsItem.subscriptionId) return;

      await tx.subscription.update({
        where: { id: vpsItem.subscriptionId },
        data: { status: SubscriptionStatus.PAST_DUE },
      });

      await tx.auditLog.create({
        data: {
          userId: order.userId,
          action: 'PAYMENT_ACTION',
          resourceType: 'Subscription',
          resourceId: vpsItem.subscriptionId,
          newValues: { status: SubscriptionStatus.PAST_DUE },
          severity: 'WARN',
        },
      });
    });
  }
}

export async function getProvisioningService(): Promise<ProvisioningService> {
  return new ProvisioningService();
}