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

export abstract class VPSProvider {
  protected config: VPSProviderConfig;
  protected logger: Console;

  constructor(config: VPSProviderConfig) {
    this.config = config;
    this.logger = console;
    this.validateConfig();
  }

  protected validateConfig(): void {
    if (this.config.type === 'mock') return;

    const required = ['apiUrl', 'apiKey', 'apiSecret'];
    const missing = required.filter((key) => !this.config[key as keyof VPSProviderConfig]);

    if (missing.length > 0) {
      this.logger.warn(
        `[${this.constructor.name}] Missing configuration: ${missing.join(', ')}. ` +
        `Provider will return PROVIDER_NOT_CONFIGURED errors.`
      );
    }
  }

  abstract createServer(options: ServerCreateOptions): Promise<ServerActionResult>;
  abstract deleteServer(serverId: string): Promise<ServerActionResult>;
  abstract startServer(serverId: string): Promise<ServerActionResult>;
  abstract stopServer(serverId: string, force?: boolean): Promise<ServerActionResult>;
  abstract restartServer(serverId: string): Promise<ServerActionResult>;
  abstract reinstallServer(serverId: string, osTemplate: string): Promise<ServerActionResult>;
  abstract getServer(serverId: string): Promise<ServerInfo | null>;
  abstract getServerStatus(serverId: string): Promise<ServerStatus>;
  abstract getServerMetrics(serverId: string): Promise<ServerMetrics | null>;
  abstract getConsole(serverId: string): Promise<ConsoleCredentials | null>;
  abstract listServers(): Promise<ServerInfo[]>;
  abstract getOSOptions(): Promise<OSOption[]>;
  abstract healthCheck(): Promise<ProviderHealthCheck>;
  
  abstract provisionServer(context: ProvisioningContext, options: ServerCreateOptions): Promise<ProvisioningResult>;
  abstract getServerByIdempotencyKey(idempotencyKey: string): Promise<ServerInfo | null>;

  protected mapStatus(providerStatus: string): ServerStatus {
    const statusMap: Record<string, ServerStatus> = {
      running: 'running',
      started: 'running',
      active: 'running',
      stopped: 'stopped',
      poweroff: 'stopped',
      halted: 'stopped',
      starting: 'starting',
      booting: 'starting',
      stopping: 'stopping',
      shutting_down: 'stopping',
      restarting: 'restarting',
      rebooting: 'restarting',
      reinstalling: 'reinstalling',
      installing: 'reinstalling',
      creating: 'creating',
      provisioning: 'creating',
      error: 'error',
      failed: 'error',
      destroyed: 'destroyed',
      deleted: 'destroyed',
    };
    return statusMap[providerStatus.toLowerCase()] || 'unknown';
  }

  protected isConfigured(): boolean {
    if (this.config.type === 'mock') return true;
    return !!(this.config.apiUrl && this.config.apiKey && this.config.apiSecret);
  }

  protected notConfiguredError(action: string): ServerActionResult {
    this.logger.error(`[${this.constructor.name}] ${action} failed: provider not configured`);
    return {
      success: false,
      message: `VPS provider is not configured. Cannot ${action}. Set VPS_PROVIDER and required credentials.`,
      errorCode: 'PROVIDER_NOT_CONFIGURED',
    };
  }

  protected notConfiguredResult<T>(): T | null {
    return null;
  }

  protected async withTimeout<T>(promise: Promise<T>, ms = 30000): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    );
    return Promise.race([promise, timeout]);
  }

  protected logAction(action: string, serverId: string, success: boolean, details?: Record<string, unknown>): void {
    this.logger.log(
      `[${this.constructor.name}] ${action} ${success ? 'succeeded' : 'failed'} for server ${serverId}`,
      details || ''
    );
  }
}

import { ProxmoxProvider } from './proxmox-provider';
import { VirtualizorProvider } from './virtualizor-provider';
import { MockProvider } from './mock-provider';

export function createVPSProvider(config?: Partial<VPSProviderConfig>): VPSProvider {
  const providerType = (config?.type || process.env.VPS_PROVIDER || 'mock') as 'proxmox' | 'virtualizor' | 'mock';
  
  const fullConfig: VPSProviderConfig = {
    type: providerType,
    apiUrl: config?.apiUrl || process.env.PROXMOX_HOST || process.env.VIRTUALIZOR_URL,
    apiKey: config?.apiKey || process.env.PROXMOX_TOKEN_ID || process.env.VIRTUALIZOR_API_KEY,
    apiSecret: config?.apiSecret || process.env.PROXMOX_TOKEN_SECRET || process.env.VIRTUALIZOR_API_PASS,
    nodeId: config?.nodeId || process.env.PROXMOX_NODE_ID || process.env.VIRTUALIZOR_NODE_ID,
    username: config?.username,
    password: config?.password,
    verifySSL: config?.verifySSL ?? (process.env.VPS_VERIFY_SSL !== 'false'),
    timeoutMs: config?.timeoutMs ? parseInt(String(config.timeoutMs), 10) : 30000,
  };

  switch (providerType) {
    case 'proxmox':
      return new ProxmoxProvider(fullConfig);
    case 'virtualizor':
      return new VirtualizorProvider(fullConfig);
    case 'mock':
    default:
      return new MockProvider(fullConfig);
  }
}

export function getProviderConfigFromEnv(): VPSProviderConfig {
  return {
    type: (process.env.VPS_PROVIDER as 'proxmox' | 'virtualizor' | 'mock') || 'mock',
    apiUrl: process.env.PROXMOX_HOST || process.env.VIRTUALIZOR_URL,
    apiKey: process.env.PROXMOX_TOKEN_ID || process.env.VIRTUALIZOR_API_KEY,
    apiSecret: process.env.PROXMOX_TOKEN_SECRET || process.env.VIRTUALIZOR_API_PASS,
    nodeId: process.env.PROXMOX_NODE_ID || process.env.VIRTUALIZOR_NODE_ID,
    verifySSL: process.env.VPS_VERIFY_SSL !== 'false',
    timeoutMs: parseInt(process.env.VPS_TIMEOUT_MS || '30000', 10),
  };
}