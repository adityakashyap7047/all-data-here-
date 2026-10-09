import { VPSProvider } from './vps-provider';
import {
  VPSProviderConfig,
  ServerCreateOptions,
  ServerInfo,
  ServerActionResult,
  ServerStatus,
  ServerMetrics,
  ConsoleCredentials,
  ProviderHealthCheck,
  OSOption,
  ProvisioningContext,
  ProvisioningResult,
} from './types';

interface VirtualizorVM {
  vpsid: number;
  hostname: string;
  status: string;
  ram: number;
  cpu: number;
  space: number;
  bandwidth: number;
  ipv4: string[];
  ipv6: string[];
  os: string;
  virt: string;
  nodeid: number;
  created: number;
}

interface VirtualizorAPIResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
}

interface VirtualizorOS {
  name: string;
  filename: string;
}

export class VirtualizorProvider extends VPSProvider {
  constructor(config: VPSProviderConfig) {
    super(config);
    if (!config.apiUrl || !config.apiKey || !config.apiSecret) {
      this.logger.warn('[VirtualizorProvider] Missing required configuration. Provider will return PROVIDER_NOT_CONFIGURED errors.');
    }
  }

  private async request<T>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<VirtualizorAPIResponse<T>> {
    const url = new URL(`${this.config.apiUrl}/api/${endpoint}`);
    url.searchParams.append('apikey', this.config.apiKey!);
    url.searchParams.append('apipass', this.config.apiSecret!);

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs || 30000);

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeout);
      this.logger.error('[VirtualizorProvider] Request error:', error);
      return { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async createServer(options: ServerCreateOptions): Promise<ServerActionResult> {
    if (!this.isConfigured()) {
      return this.notConfiguredError('create server');
    }

    try {
      const params = {
        hostname: options.hostname,
        password: crypto.randomUUID(),
        numcpu: options.specs.cpuCores.toString(),
        ram: options.specs.ramMb.toString(),
        space: options.specs.storageGb.toString(),
        bandwidth: (options.specs.bandwidthTb * 1024).toString(),
        ips: options.specs.ipv4Count.toString(),
        ipv6: options.specs.ipv6Count.toString(),
        osid: options.osTemplate,
        virt: 'kvm',
        node: this.config.nodeId || '1',
        vnc: '1',
        secureshared: '1',
      };

      const result = await this.request<{ vpsid: number }>('vs.create', params);

      if (result.status !== 'success' || !result.data) {
        throw new Error(result.error || 'Failed to create VPS');
      }

      this.logAction('createServer', `virtualizor-${result.data.vpsid}`, true, { vpsid: result.data.vpsid });
      return {
        success: true,
        message: 'Server creation initiated',
        data: { serverId: `virtualizor-${result.data.vpsid}`, vpsid: result.data.vpsid },
        providerTaskId: result.data.vpsid.toString(),
      };
    } catch (error) {
      this.logger.error('[VirtualizorProvider] Create server error:', error);
      this.logAction('createServer', options.name, false, { error: error instanceof Error ? error.message : 'Unknown' });
      return {
        success: false,
        message: `Failed to create server: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errorCode: 'CREATE_FAILED',
      };
    }
  }

  async deleteServer(serverId: string): Promise<ServerActionResult> {
    if (!this.isConfigured()) {
      return this.notConfiguredError('delete server');
    }

    try {
      const vpsid = parseInt(serverId.replace('virtualizor-', ''), 10);

      const result = await this.request('vs.delete', { vpsid: vpsid.toString() });

      if (result.status !== 'success') {
        throw new Error(result.error || 'Delete failed');
      }

      this.logAction('deleteServer', serverId, true);
      return { success: true, message: 'Server destroyed successfully' };
    } catch (error) {
      this.logger.error('[VirtualizorProvider] Destroy error:', error);
      this.logAction('deleteServer', serverId, false, { error: error instanceof Error ? error.message : 'Unknown' });
      return {
        success: false,
        message: `Failed to destroy: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errorCode: 'DESTROY_FAILED',
      };
    }
  }

  async getServer(serverId: string): Promise<ServerInfo | null> {
    if (!this.isConfigured()) return null;

    try {
      const vpsid = parseInt(serverId.replace('virtualizor-', ''), 10);
      if (isNaN(vpsid)) return null;

      const result = await this.request<{ vps: VirtualizorVM }>('vs.info', { vpsid: vpsid.toString() });

      if (result.status !== 'success' || !result.data) {
        return null;
      }

      return this.mapVMToServerInfo(result.data.vps);
    } catch (error) {
      this.logger.error('[VirtualizorProvider] Get server error:', error);
      return null;
    }
  }

  async getServerStatus(serverId: string): Promise<ServerStatus> {
    const server = await this.getServer(serverId);
    return server?.status || 'unknown';
  }

  async getServerMetrics(serverId: string): Promise<ServerMetrics | null> {
    if (!this.isConfigured()) return null;

    try {
      const vpsid = parseInt(serverId.replace('virtualizor-', ''), 10);
      const result = await this.request<{ vps: { cpu_usage: number; ram_usage: number; disk_usage: number; net_in: number; net_out: number } }>('vs.stats', { vpsid: vpsid.toString() });

      if (result.status !== 'success' || !result.data) {
        return null;
      }

      return {
        cpuUsagePercent: result.data.vps.cpu_usage,
        memoryUsagePercent: result.data.vps.ram_usage,
        diskUsagePercent: result.data.vps.disk_usage,
        networkInBytesPerSec: result.data.vps.net_in,
        networkOutBytesPerSec: result.data.vps.net_out,
        diskReadBytesPerSec: 0,
        diskWriteBytesPerSec: 0,
        uptimeSeconds: 0,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('[VirtualizorProvider] Metrics error:', error);
      return null;
    }
  }

  async getServerByIdempotencyKey(idempotencyKey: string): Promise<ServerInfo | null> {
    try {
      const servers = await this.listServers();
      return servers.find(s => s.providerData?.idempotencyKey === idempotencyKey) || null;
    } catch {
      return null;
    }
  }

  async provisionServer(context: ProvisioningContext, options: ServerCreateOptions): Promise<ProvisioningResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'VPS provider is not configured. Cannot provision server.',
        errorCode: 'PROVIDER_NOT_CONFIGURED',
      };
    }

    try {
      const existing = await this.getServerByIdempotencyKey(context.idempotencyKey);
      if (existing) {
        this.logger.log(`[VirtualizorProvider] Server already exists for idempotency key ${context.idempotencyKey}: ${existing.id}`);
        return {
          success: true,
          serverId: existing.id,
          providerServerId: existing.providerData?.vpsid?.toString(),
          message: 'Server already provisioned (idempotent)',
        };
      }

      const createOptions = {
        ...options,
        userData: JSON.stringify({ ...JSON.parse(options.userData || '{}'), orderId: context.orderId, userId: context.userId, idempotencyKey: context.idempotencyKey }),
      };

      const result = await this.createServer(createOptions);

      if (!result.success) {
        return {
          success: false,
          message: result.message,
          errorCode: result.errorCode,
        };
      }

      const serverId = result.data?.serverId as string;
      const server = await this.getServer(serverId);

      return {
        success: true,
        serverId,
        providerServerId: result.data?.vpsid?.toString(),
        message: 'Server provisioned successfully',
        providerTaskId: result.providerTaskId,
      };
    } catch (error) {
      this.logger.error('[VirtualizorProvider] Provision error:', error);
      return {
        success: false,
        message: `Provisioning failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errorCode: 'PROVISION_FAILED',
      };
    }
  }

  async listServers(): Promise<ServerInfo[]> {
    if (!this.isConfigured()) return [];

    try {
      const result = await this.request<{ vps: Record<string, VirtualizorVM> }>('vs.list');

      if (result.status !== 'success' || !result.data) {
        return [];
      }

      return Object.values(result.data.vps).map(this.mapVMToServerInfo);
    } catch (error) {
      this.logger.error('[VirtualizorProvider] List servers error:', error);
      return [];
    }
  }

  async getOSOptions(): Promise<OSOption[]> {
    if (!this.isConfigured()) return [];

    try {
      const result = await this.request<{ os: Record<string, VirtualizorOS> }>('os.list');

      if (result.status !== 'success' || !result.data) {
        return [];
      }

      return Object.entries(result.data.os).map(([id, os]) => ({
        id: os.filename,
        name: os.name,
        version: 'latest',
        architecture: 'x86_64' as const,
        isDefault: os.name.toLowerCase().includes('ubuntu'),
      }));
    } catch (error) {
      this.logger.error('[VirtualizorProvider] OS options error:', error);
      return [];
    }
  }

  async healthCheck(): Promise<ProviderHealthCheck> {
    if (!this.isConfigured()) {
      return { healthy: false, error: 'VPS provider is not configured' };
    }

    try {
      const start = Date.now();
      const result = await this.request<{ version: string }>('server.info');
      const latencyMs = Date.now() - start;

      return {
        healthy: result.status === 'success',
        latencyMs,
        version: result.data?.version,
        error: result.status !== 'success' ? result.error : undefined,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Health check failed',
      };
    }
  }

  async getConsole(serverId: string): Promise<ConsoleCredentials | null> {
    if (!this.isConfigured()) return null;

    try {
      const vpsid = parseInt(serverId.replace('virtualizor-', ''), 10);

      const result = await this.request<{ vnc: { url: string; pass: string } }>('vs.vnc', {
        vpsid: vpsid.toString(),
      });

      if (result.status !== 'success' || !result.data) {
        return null;
      }

      return {
        url: result.data.vnc.url,
        token: result.data.vnc.pass,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        protocol: 'vnc',
      };
    } catch (error) {
      this.logger.error('[VirtualizorProvider] Console error:', error);
      return null;
    }
  }

  private async vmAction(serverId: string, action: string): Promise<ServerActionResult> {
    if (!this.isConfigured()) {
      return this.notConfiguredError(`${action} server`);
    }

    try {
      const vpsid = parseInt(serverId.replace('virtualizor-', ''), 10);

      const result = await this.request(`vs.${action}`, { vpsid: vpsid.toString() });

      if (result.status !== 'success') {
        throw new Error(result.error || `${action} failed`);
      }

      this.logAction(action, serverId, true);
      return { success: true, message: `Server ${action} initiated` };
    } catch (error) {
      this.logger.error(`[VirtualizorProvider] ${action} error:`, error);
      this.logAction(action, serverId, false, { error: error instanceof Error ? error.message : 'Unknown' });
      return {
        success: false,
        message: `Failed to ${action} server: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errorCode: 'ACTION_FAILED',
      };
    }
  }

  private mapVMToServerInfo(vm: VirtualizorVM): ServerInfo {
    return {
      id: `virtualizor-${vm.vpsid}`,
      name: vm.hostname,
      hostname: vm.hostname,
      status: this.mapStatus(vm.status),
      ipv4: vm.ipv4[0],
      ipv6: vm.ipv6[0],
      specs: {
        cpuCores: vm.cpu,
        ramMb: vm.ram,
        storageGb: vm.space,
        bandwidthTb: vm.bandwidth / 1024,
        ipv4Count: vm.ipv4.length,
        ipv6Count: vm.ipv6.length,
      },
      location: `node-${vm.nodeid}`,
      osTemplate: vm.os,
      createdAt: new Date(vm.created * 1000),
      updatedAt: new Date(),
      billingStatus: 'active',
      providerData: { vpsid: vm.vpsid },
    };
  }
}