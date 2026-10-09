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

interface ProxmoxNode {
  node: string;
  status: string;
  cpu: number;
  maxcpu: number;
  mem: number;
  maxmem: number;
  disk: number;
  maxdisk: number;
}

interface ProxmoxVM {
  vmid: number;
  name: string;
  status: string;
  cpu: number;
  maxcpu: number;
  mem: number;
  maxmem: number;
  disk: number;
  maxdisk: number;
  netin: number;
  netout: number;
  diskread: number;
  diskwrite: number;
  uptime: number;
}

interface ProxmoxAuthResponse {
  data: {
    ticket: string;
    CSRFPreventionToken: string;
    username: string;
  };
}

interface ProxmoxTaskStatus {
  data: {
    status: string;
    exitstatus?: string;
  };
}

interface ProxmoxVNCProxy {
  data: {
    port: number;
    ticket: string;
    user: string;
  };
}

export class ProxmoxProvider extends VPSProvider {
  private ticket: string | null = null;
  private csrfToken: string | null = null;
  private ticketExpiry: number = 0;

  constructor(config: VPSProviderConfig) {
    super(config);
    if (!config.apiUrl || !config.apiKey || !config.apiSecret) {
      this.logger.warn('[ProxmoxProvider] Missing required configuration. Provider will return PROVIDER_NOT_CONFIGURED errors.');
    }
  }

  private async authenticate(): Promise<boolean> {
    if (this.ticket && Date.now() < this.ticketExpiry) {
      return true;
    }

    try {
      const url = `${this.config.apiUrl}/api2/json/access/ticket`;
      const params = new URLSearchParams({
        username: this.config.apiKey!,
        password: this.config.apiSecret!,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data: ProxmoxAuthResponse = await response.json();
      this.ticket = data.data.ticket;
      this.csrfToken = data.data.CSRFPreventionToken;
      this.ticketExpiry = Date.now() + 2 * 60 * 60 * 1000;
      return true;
    } catch (error) {
      this.logger.error('[ProxmoxProvider] Authentication error:', error);
      this.ticket = null;
      this.csrfToken = null;
      return false;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const authenticated = await this.authenticate();
    if (!authenticated) {
      throw new Error('Failed to authenticate with Proxmox');
    }

    const url = `${this.config.apiUrl}/api2/json${endpoint}`;
    const headers: Record<string, string> = {
      'Cookie': `PVEAuthCookie=${this.ticket}`,
      'CSRFPreventionToken': this.csrfToken!,
      ...(options.headers as Record<string, string>),
    };

    if (options.method && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs || 30000);

    try {
      const response = await fetch(url, { ...options, headers, signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Proxmox API error: ${response.status} ${errorText}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  async createServer(options: ServerCreateOptions): Promise<ServerActionResult> {
    if (!this.isConfigured()) {
      return this.notConfiguredError('create server');
    }

    try {
      const node = this.config.nodeId || await this.getDefaultNode();
      const vmid = await this.getNextVMID();

      const params = new URLSearchParams({
        vmid: vmid.toString(),
        name: options.name,
        ostemplate: options.osTemplate,
        cores: options.specs.cpuCores.toString(),
        memory: (options.specs.ramMb / 1024).toString(),
        'disk[scsi0]': `local-lvm:${options.specs.storageGb},format=raw`,
        net0: 'virtio,bridge=vmbr0',
        onboot: '1',
        start: '1',
        sshkeys: options.sshKeyIds?.join('\n') || '',
        description: options.userData || '',
      });

      const result = await this.request<{ data: string }>(
        `/nodes/${node}/qemu`,
        { method: 'POST', body: params.toString() }
      );

      if (!result.data) {
        throw new Error('No task ID returned');
      }

      await this.waitForTask(node, result.data);

      const server = await this.getServerByVMID(vmid);
      this.logAction('createServer', `proxmox-${vmid}`, true, { vmid });
      return {
        success: true,
        message: 'Server created successfully',
        data: { serverId: server?.id, vmid },
        providerTaskId: result.data,
      };
    } catch (error) {
      this.logger.error('[ProxmoxProvider] Create server error:', error);
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
      const vmid = parseInt(serverId.replace('proxmox-', ''), 10);
      const node = this.config.nodeId || await this.getDefaultNode();

      const result = await this.request<{ data: string }>(
        `/nodes/${node}/qemu/${vmid}`,
        { method: 'DELETE' }
      );

      await this.waitForTask(node, result.data);

      this.logAction('deleteServer', serverId, true);
      return { success: true, message: 'Server destroyed successfully', providerTaskId: result.data };
    } catch (error) {
      this.logger.error('[ProxmoxProvider] Destroy error:', error);
      this.logAction('deleteServer', serverId, false, { error: error instanceof Error ? error.message : 'Unknown' });
      return {
        success: false,
        message: `Failed to destroy: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errorCode: 'DESTROY_FAILED',
      };
    }
  }

  async startServer(serverId: string): Promise<ServerActionResult> {
    return this.vmAction(serverId, 'start');
  }

  async stopServer(serverId: string, force = false): Promise<ServerActionResult> {
    return this.vmAction(serverId, force ? 'stop' : 'shutdown');
  }

  async restartServer(serverId: string): Promise<ServerActionResult> {
    return this.vmAction(serverId, 'reboot');
  }

  async reinstallServer(serverId: string, osTemplate: string): Promise<ServerActionResult> {
    if (!this.isConfigured()) {
      return this.notConfiguredError('reinstall server');
    }

    try {
      const vmid = parseInt(serverId.replace('proxmox-', ''), 10);
      const node = this.config.nodeId || await this.getDefaultNode();

      await this.vmAction(serverId, 'stop');
      await new Promise((r) => setTimeout(r, 5000));

      const params = new URLSearchParams({
        vmid: vmid.toString(),
        ostemplate: osTemplate,
        storage: 'local-lvm',
      });

      const result = await this.request<{ data: string }>(
        `/nodes/${node}/qemu/${vmid}/reinstall`,
        { method: 'POST', body: params.toString() }
      );

      await this.waitForTask(node, result.data);

      this.logAction('reinstallServer', serverId, true, { osTemplate });
      return { success: true, message: `Server reinstall with ${osTemplate} initiated`, providerTaskId: result.data };
    } catch (error) {
      this.logger.error('[ProxmoxProvider] Reinstall error:', error);
      this.logAction('reinstallServer', serverId, false, { error: error instanceof Error ? error.message : 'Unknown' });
      return {
        success: false,
        message: `Failed to reinstall: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errorCode: 'REINSTALL_FAILED',
      };
    }
  }

  async getServer(serverId: string): Promise<ServerInfo | null> {
    if (!this.isConfigured()) return null;

    try {
      const vmid = parseInt(serverId.replace('proxmox-', ''), 10);
      if (isNaN(vmid)) return null;

      return await this.getServerByVMID(vmid);
    } catch (error) {
      this.logger.error('[ProxmoxProvider] Get server error:', error);
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
      const vmid = parseInt(serverId.replace('proxmox-', ''), 10);
      const node = this.config.nodeId || await this.getDefaultNode();

      const result = await this.request<{ data: { data: Array<{ time: number; cpu: number; mem: number; diskread: number; diskwrite: number; netin: number; netout: number }> } }>(
        `/nodes/${node}/qemu/${vmid}/rrddata?timeframe=hour`
      );

      const dataPoints = result.data?.data;
      if (!dataPoints || dataPoints.length === 0) return null;

      const latest = dataPoints[dataPoints.length - 1];
      const maxmem = 1024 * 1024 * 1024; // Would need to get from config

      return {
        cpuUsagePercent: latest.cpu * 100,
        memoryUsagePercent: (latest.mem / maxmem) * 100,
        diskUsagePercent: 0, // Would need disk capacity
        networkInBytesPerSec: latest.netin,
        networkOutBytesPerSec: latest.netout,
        diskReadBytesPerSec: latest.diskread,
        diskWriteBytesPerSec: latest.diskwrite,
        uptimeSeconds: 0, // Would need from VM config
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('[ProxmoxProvider] Metrics error:', error);
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
        this.logger.log(`[ProxmoxProvider] Server already exists for idempotency key ${context.idempotencyKey}: ${existing.id}`);
        return {
          success: true,
          serverId: existing.id,
          providerServerId: existing.providerData?.vmid?.toString(),
          message: 'Server already provisioned (idempotent)',
        };
      }

      const createOptions = {
        ...options,
        idempotencyKey: context.idempotencyKey,
        userData: JSON.stringify({ ...JSON.parse(options.userData || '{}'), orderId: context.orderId, userId: context.userId }),
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
        providerServerId: result.data?.vmid?.toString(),
        message: 'Server provisioned successfully',
        providerTaskId: result.providerTaskId,
      };
    } catch (error) {
      this.logger.error('[ProxmoxProvider] Provision error:', error);
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
      const node = this.config.nodeId || await this.getDefaultNode();
      const result = await this.request<{ data: ProxmoxVM[] }>(`/nodes/${node}/qemu`);
      return result.data.map((vm) => this.mapVMToServerInfo(vm));
    } catch (error) {
      this.logger.error('[ProxmoxProvider] List servers error:', error);
      return [];
    }
  }

  async getOSOptions(): Promise<OSOption[]> {
    if (!this.isConfigured()) return [];

    try {
      const node = this.config.nodeId || await this.getDefaultNode();
      const result = await this.request<{ data: Array<{ volid: string; format: string }> }>(
        `/nodes/${node}/storage/local/content`
      );

      return result.data
        .filter((f) => f.format === 'vztmpl')
        .map((f) => {
          const match = f.volid.match(/([a-z0-9-]+)-(\d+(\.\d+)?)-/);
          return {
            id: f.volid,
            name: match?.[1] || 'Unknown',
            version: match?.[2] || 'latest',
            architecture: 'x86_64' as const,
            isDefault: f.volid.includes('ubuntu-24.04'),
          };
        });
    } catch (error) {
      this.logger.error('[ProxmoxProvider] OS options error:', error);
      return [];
    }
  }

  async healthCheck(): Promise<ProviderHealthCheck> {
    if (!this.isConfigured()) {
      return { healthy: false, error: 'VPS provider is not configured' };
    }

    try {
      const start = Date.now();
      await this.authenticate();
      const latencyMs = Date.now() - start;

      const node = this.config.nodeId || await this.getDefaultNode();
      const result = await this.request<{ data: ProxmoxNode }>(`/nodes/${node}/status`);

      return {
        healthy: true,
        latencyMs,
        version: result.data.status,
        details: { node: result.data.node, cpu: result.data.cpu, mem: result.data.mem },
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
      const vmid = parseInt(serverId.replace('proxmox-', ''), 10);
      const node = this.config.nodeId || await this.getDefaultNode();

      const result = await this.request<ProxmoxVNCProxy>(
        `/nodes/${node}/qemu/${vmid}/vncproxy`,
        { method: 'POST', body: new URLSearchParams({ websocket: '1' }).toString() }
      );

      return {
        url: `${this.config.apiUrl}/vnc.html?path=${node}/qemu/${vmid}/vncproxy`,
        token: result.data.ticket,
        username: result.data.user,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        protocol: 'vnc',
      };
    } catch (error) {
      this.logger.error('[ProxmoxProvider] Console error:', error);
      return null;
    }
  }

  private async vmAction(serverId: string, action: string): Promise<ServerActionResult> {
    if (!this.isConfigured()) {
      return this.notConfiguredError(`${action} server`);
    }

    try {
      const vmid = parseInt(serverId.replace('proxmox-', ''), 10);
      const node = this.config.nodeId || await this.getDefaultNode();

      const result = await this.request<{ data: string }>(
        `/nodes/${node}/qemu/${vmid}/status/${action}`,
        { method: 'POST' }
      );

      await this.waitForTask(node, result.data);

      this.logAction(action, serverId, true);
      return { success: true, message: `Server ${action} initiated`, providerTaskId: result.data };
    } catch (error) {
      this.logger.error(`[ProxmoxProvider] ${action} error:`, error);
      this.logAction(action, serverId, false, { error: error instanceof Error ? error.message : 'Unknown' });
      return {
        success: false,
        message: `Failed to ${action} server: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errorCode: 'ACTION_FAILED',
      };
    }
  }

  private async getServerByVMID(vmid: number): Promise<ServerInfo | null> {
    try {
      const node = this.config.nodeId || await this.getDefaultNode();
      const result = await this.request<{ data: ProxmoxVM }>(`/nodes/${node}/qemu/${vmid}/config`);

      const vm = result.data;
      return this.mapVMToServerInfo(vm);
    } catch {
      return null;
    }
  }

  private mapVMToServerInfo(vm: ProxmoxVM): ServerInfo {
    return {
      id: `proxmox-${vm.vmid}`,
      name: vm.name,
      hostname: `${vm.name}.notixcloud.dev`,
      status: this.mapStatus(vm.status),
      specs: {
        cpuCores: vm.maxcpu,
        ramMb: vm.maxmem,
        storageGb: Math.round(vm.maxdisk / 1024 / 1024 / 1024),
        bandwidthTb: 0,
        ipv4Count: 1,
        ipv6Count: 0,
      },
      location: this.config.nodeId || 'unknown',
      osTemplate: 'unknown',
      createdAt: new Date(Date.now() - vm.uptime * 1000),
      updatedAt: new Date(),
      billingStatus: 'active',
      providerData: { vmid: vm.vmid },
    };
  }

  private async getNextVMID(): Promise<number> {
    const servers = await this.listServers();
    const maxId = servers.reduce((max, s) => {
      const id = parseInt(s.id.replace('proxmox-', ''), 10);
      return id > max ? id : max;
    }, 100);
    return maxId + 1;
  }

  private async getDefaultNode(): Promise<string> {
    const result = await this.request<{ data: ProxmoxNode[] }>('/nodes');
    return result.data[0]?.node || 'pve';
  }

  private async waitForTask(node: string, taskId: string): Promise<void> {
    const maxAttempts = 300; // 5 minutes
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await this.request<ProxmoxTaskStatus>(
        `/nodes/${node}/tasks/${taskId}/status`
      );

      if (result.data.status === 'stopped') {
        if (result.data.exitstatus && result.data.exitstatus !== 'OK') {
          throw new Error(`Task failed: ${result.data.exitstatus}`);
        }
        return;
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    throw new Error('Task timeout');
  }
}