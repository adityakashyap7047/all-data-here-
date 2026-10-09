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

const MOCK_SERVERS = new Map<string, ServerInfo>();

export class MockProvider extends VPSProvider {
  constructor(config: VPSProviderConfig) {
    super(config);
    if (MOCK_SERVERS.size === 0) {
      this.seedMockData();
    }
  }

  private seedMockData() {
    const mockServers: ServerInfo[] = [
      {
        id: 'mock-srv-001',
        name: 'web-prod-01',
        hostname: 'web-prod-01.notixcloud.dev',
        status: 'running',
        ipv4: '203.0.113.10',
        ipv6: '2001:db8::10',
        specs: { cpuCores: 4, ramMb: 8192, storageGb: 160, bandwidthTb: 5, ipv4Count: 1, ipv6Count: 1 },
        location: 'New York',
        osTemplate: 'ubuntu-24.04',
        osVersion: '24.04 LTS',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        billingStatus: 'active',
        nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'mock-srv-002',
        name: 'db-primary',
        hostname: 'db-primary.notixcloud.dev',
        status: 'running',
        ipv4: '203.0.113.20',
        ipv6: '2001:db8::20',
        specs: { cpuCores: 8, ramMb: 16384, storageGb: 320, bandwidthTb: 10, ipv4Count: 2, ipv6Count: 2 },
        location: 'Frankfurt',
        osTemplate: 'rockylinux-9',
        osVersion: '9.4',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        billingStatus: 'active',
        nextDueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'mock-srv-003',
        name: 'staging-app',
        hostname: 'staging-app.notixcloud.dev',
        status: 'stopped',
        ipv4: '203.0.113.30',
        specs: { cpuCores: 2, ramMb: 4096, storageGb: 80, bandwidthTb: 3, ipv4Count: 1, ipv6Count: 1 },
        location: 'London',
        osTemplate: 'debian-12',
        osVersion: '12.5',
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-10'),
        billingStatus: 'active',
        nextDueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
    ];

    mockServers.forEach((s) => MOCK_SERVERS.set(s.id, s));
  }

  async createServer(options: ServerCreateOptions): Promise<ServerActionResult> {
    if (!this.isConfigured()) {
      return this.notConfiguredError('create server');
    }

    const id = `mock-srv-${Date.now()}`;
    const server: ServerInfo = {
      id,
      name: options.name,
      hostname: options.hostname,
      status: 'creating',
      specs: options.specs,
      location: options.locationId,
      osTemplate: options.osTemplate,
      createdAt: new Date(),
      updatedAt: new Date(),
      billingStatus: 'active',
      nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      providerData: { idempotencyKey: options.idempotencyKey },
    };

    MOCK_SERVERS.set(id, server);

    setTimeout(() => {
      const s = MOCK_SERVERS.get(id);
      if (s) {
        s.status = 'running';
        s.ipv4 = `203.0.113.${100 + MOCK_SERVERS.size}`;
        s.ipv6 = `2001:db8::${100 + MOCK_SERVERS.size}`;
        s.updatedAt = new Date();
      }
    }, 5000);

    this.logAction('createServer', id, true, { idempotencyKey: options.idempotencyKey });
    return {
      success: true,
      message: 'Server creation initiated. Provisioning will complete in a few minutes.',
      data: { serverId: id },
    };
  }

  async deleteServer(serverId: string): Promise<ServerActionResult> {
    if (!this.isConfigured()) {
      return this.notConfiguredError('delete server');
    }

    const server = MOCK_SERVERS.get(serverId);
    if (!server) {
      return { success: false, message: 'Server not found', errorCode: 'NOT_FOUND' };
    }

    server.status = 'destroyed';
    server.updatedAt = new Date();

    setTimeout(() => {
      MOCK_SERVERS.delete(serverId);
    }, 1000);

    this.logAction('deleteServer', serverId, true);
    return { success: true, message: 'Server destruction initiated' };
  }

  async getServer(serverId: string): Promise<ServerInfo | null> {
    if (!this.isConfigured()) {
      return null;
    }
    return MOCK_SERVERS.get(serverId) || null;
  }

  async getServerStatus(serverId: string): Promise<ServerStatus> {
    const server = await this.getServer(serverId);
    return server?.status || 'unknown';
  }

  async getServerMetrics(serverId: string): Promise<ServerMetrics | null> {
    if (!this.isConfigured()) return null;

    const server = MOCK_SERVERS.get(serverId);
    if (!server) return null;

    return {
      cpuUsagePercent: Math.random() * 30,
      memoryUsagePercent: Math.random() * 60,
      diskUsagePercent: Math.random() * 40,
      networkInBytesPerSec: Math.random() * 1024 * 1024 * 10,
      networkOutBytesPerSec: Math.random() * 1024 * 1024 * 5,
      diskReadBytesPerSec: Math.random() * 1024 * 1024 * 2,
      diskWriteBytesPerSec: Math.random() * 1024 * 1024 * 2,
      uptimeSeconds: server.status === 'running' ? Math.floor((Date.now() - server.createdAt.getTime()) / 1000) : 0,
      timestamp: new Date(),
    };
  }

  async getServerByIdempotencyKey(idempotencyKey: string): Promise<ServerInfo | null> {
    for (const server of MOCK_SERVERS.values()) {
      if (server.providerData?.idempotencyKey === idempotencyKey) {
        return server;
      }
    }
    return null;
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
        this.logger.log(`[MockProvider] Server already exists for idempotency key ${context.idempotencyKey}: ${existing.id}`);
        return {
          success: true,
          serverId: existing.id,
          message: 'Server already provisioned (idempotent)',
        };
      }

      const createOptions = {
        ...options,
        idempotencyKey: context.idempotencyKey,
      };

      const result = await this.createServer(createOptions);

      if (!result.success) {
        return {
          success: false,
          message: result.message,
          errorCode: result.errorCode,
        };
      }

      return {
        success: true,
        serverId: result.data?.serverId as string,
        message: 'Server provisioned successfully',
      };
    } catch (error) {
      this.logger.error('[MockProvider] Provision error:', error);
      return {
        success: false,
        message: `Provisioning failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errorCode: 'PROVISION_FAILED',
      };
    }
  }

  async listServers(): Promise<ServerInfo[]> {
    if (!this.isConfigured()) {
      return [];
    }
    return Array.from(MOCK_SERVERS.values());
  }

  async startServer(serverId: string): Promise<ServerActionResult> {
    if (!this.isConfigured()) {
      return this.notConfiguredError('start server');
    }

    const server = MOCK_SERVERS.get(serverId);
    if (!server) {
      return { success: false, message: 'Server not found', errorCode: 'NOT_FOUND' };
    }

    if (server.status === 'running') {
      return { success: false, message: 'Server is already running', errorCode: 'ALREADY_RUNNING' };
    }

    server.status = 'starting';
    server.updatedAt = new Date();

    setTimeout(() => {
      const s = MOCK_SERVERS.get(serverId);
      if (s) {
        s.status = 'running';
        s.updatedAt = new Date();
      }
    }, 3000);

    this.logAction('startServer', serverId, true);
    return { success: true, message: 'Server start initiated' };
  }

  async stopServer(serverId: string, force = false): Promise<ServerActionResult> {
    if (!this.isConfigured()) {
      return this.notConfiguredError('stop server');
    }

    const server = MOCK_SERVERS.get(serverId);
    if (!server) {
      return { success: false, message: 'Server not found', errorCode: 'NOT_FOUND' };
    }

    if (server.status === 'stopped') {
      return { success: false, message: 'Server is already stopped', errorCode: 'ALREADY_STOPPED' };
    }

    server.status = 'stopping';
    server.updatedAt = new Date();

    setTimeout(() => {
      const s = MOCK_SERVERS.get(serverId);
      if (s) {
        s.status = 'stopped';
        s.updatedAt = new Date();
      }
    }, 3000);

    this.logAction('stopServer', serverId, true, { force });
    return { success: true, message: force ? 'Server force stop initiated' : 'Server stop initiated' };
  }

  async restartServer(serverId: string): Promise<ServerActionResult> {
    if (!this.isConfigured()) {
      return this.notConfiguredError('restart server');
    }

    const server = MOCK_SERVERS.get(serverId);
    if (!server) {
      return { success: false, message: 'Server not found', errorCode: 'NOT_FOUND' };
    }

    server.status = 'restarting';
    server.updatedAt = new Date();

    setTimeout(() => {
      const s = MOCK_SERVERS.get(serverId);
      if (s) {
        s.status = 'running';
        s.updatedAt = new Date();
      }
    }, 5000);

    this.logAction('restartServer', serverId, true);
    return { success: true, message: 'Server restart initiated' };
  }

  async reinstallServer(serverId: string, osTemplate: string): Promise<ServerActionResult> {
    if (!this.isConfigured()) {
      return this.notConfiguredError('reinstall server');
    }

    const server = MOCK_SERVERS.get(serverId);
    if (!server) {
      return { success: false, message: 'Server not found', errorCode: 'NOT_FOUND' };
    }

    server.status = 'reinstalling';
    server.osTemplate = osTemplate;
    server.updatedAt = new Date();

    setTimeout(() => {
      const s = MOCK_SERVERS.get(serverId);
      if (s) {
        s.status = 'running';
        s.osTemplate = osTemplate;
        s.updatedAt = new Date();
      }
    }, 10000);

    this.logAction('reinstallServer', serverId, true, { osTemplate });
    return { success: true, message: `Server reinstall with ${osTemplate} initiated` };
  }

  async destroyServer(serverId: string): Promise<ServerActionResult> {
    if (!this.isConfigured()) {
      return this.notConfiguredError('destroy server');
    }

    const server = MOCK_SERVERS.get(serverId);
    if (!server) {
      return { success: false, message: 'Server not found', errorCode: 'NOT_FOUND' };
    }

    server.status = 'destroyed';
    server.updatedAt = new Date();

    setTimeout(() => {
      MOCK_SERVERS.delete(serverId);
    }, 1000);

    this.logAction('destroyServer', serverId, true);
    return { success: true, message: 'Server destruction initiated' };
  }

  async getConsole(serverId: string): Promise<ConsoleCredentials | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const server = MOCK_SERVERS.get(serverId);
    if (!server) {
      return null;
    }

    return {
      url: `https://console.notixcloud.dev/vnc/${serverId}`,
      token: `vnc-token-${serverId}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      protocol: 'vnc',
    };
  }

  async getOSOptions(): Promise<OSOption[]> {
    return [
      { id: 'ubuntu-24.04', name: 'Ubuntu', version: '24.04 LTS', architecture: 'x86_64', isDefault: true },
      { id: 'ubuntu-22.04', name: 'Ubuntu', version: '22.04 LTS', architecture: 'x86_64', isDefault: false },
      { id: 'debian-12', name: 'Debian', version: '12 (Bookworm)', architecture: 'x86_64', isDefault: false },
      { id: 'debian-11', name: 'Debian', version: '11 (Bullseye)', architecture: 'x86_64', isDefault: false },
      { id: 'rockylinux-9', name: 'Rocky Linux', version: '9', architecture: 'x86_64', isDefault: false },
      { id: 'rockylinux-8', name: 'Rocky Linux', version: '8', architecture: 'x86_64', isDefault: false },
      { id: 'almalinux-9', name: 'AlmaLinux', version: '9', architecture: 'x86_64', isDefault: false },
      { id: 'almalinux-8', name: 'AlmaLinux', version: '8', architecture: 'x86_64', isDefault: false },
      { id: 'windows-2022', name: 'Windows Server', version: '2022 Datacenter', architecture: 'x86_64', isDefault: false },
      { id: 'windows-2019', name: 'Windows Server', version: '2019 Datacenter', architecture: 'x86_64', isDefault: false },
    ];
  }

  async healthCheck(): Promise<ProviderHealthCheck> {
    return {
      healthy: this.isConfigured(),
      latencyMs: this.isConfigured() ? 12 : undefined,
      version: 'mock-1.0.0',
      error: this.isConfigured() ? undefined : 'VPS provider is not configured',
    };
  }

  async getServerMetrics(serverId: string): Promise<ServerMetrics | null> {
    if (!this.isConfigured()) return null;

    const server = MOCK_SERVERS.get(serverId);
    if (!server) return null;

    return {
      cpuUsagePercent: Math.random() * 30,
      memoryUsagePercent: Math.random() * 60,
      diskUsagePercent: Math.random() * 40,
      networkInBytesPerSec: Math.random() * 1024 * 1024 * 10,
      networkOutBytesPerSec: Math.random() * 1024 * 1024 * 5,
      diskReadBytesPerSec: Math.random() * 1024 * 1024 * 2,
      diskWriteBytesPerSec: Math.random() * 1024 * 1024 * 2,
      uptimeSeconds: server.status === 'running' ? Math.floor((Date.now() - server.createdAt.getTime()) / 1000) : 0,
      timestamp: new Date(),
    };
  }

  async getServerByIdempotencyKey(idempotencyKey: string): Promise<ServerInfo | null> {
    for (const server of MOCK_SERVERS.values()) {
      if (server.providerData?.idempotencyKey === idempotencyKey) {
        return server;
      }
    }
    return null;
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
        this.logger.log(`[MockProvider] Server already exists for idempotency key ${context.idempotencyKey}: ${existing.id}`);
        return {
          success: true,
          serverId: existing.id,
          message: 'Server already provisioned (idempotent)',
        };
      }

      const createOptions = {
        ...options,
        idempotencyKey: context.idempotencyKey,
      };

      const result = await this.createServer(createOptions);

      if (!result.success) {
        return {
          success: false,
          message: result.message,
          errorCode: result.errorCode,
        };
      }

      return {
        success: true,
        serverId: result.data?.serverId as string,
        message: 'Server provisioned successfully',
      };
    } catch (error) {
      this.logger.error('[MockProvider] Provision error:', error);
      return {
        success: false,
        message: `Provisioning failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errorCode: 'PROVISION_FAILED',
      };
    }
  }
}