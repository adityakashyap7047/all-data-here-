export interface VPSProviderConfig {
  type: 'proxmox' | 'virtualizor' | 'mock';
  apiUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  nodeId?: string;
  username?: string;
  password?: string;
  verifySSL?: boolean;
  timeoutMs?: number;
}

export interface ServerSpecs {
  cpuCores: number;
  ramMb: number;
  storageGb: number;
  bandwidthTb: number;
  ipv4Count: number;
  ipv6Count: number;
}

export interface ServerCreateOptions {
  name: string;
  hostname: string;
  specs: ServerSpecs;
  locationId: string;
  osTemplate: string;
  sshKeyIds?: string[];
  userData?: string;
  idempotencyKey?: string;
  orderId?: string;
  userId?: string;
}

export interface ServerInfo {
  id: string;
  name: string;
  hostname: string;
  status: ServerStatus;
  ipv4?: string;
  ipv6?: string;
  specs: ServerSpecs;
  location: string;
  osTemplate: string;
  osVersion?: string;
  createdAt: Date;
  updatedAt: Date;
  billingStatus: BillingStatus;
  nextDueDate?: Date;
  providerData?: Record<string, unknown>;
}

export type ServerStatus =
  | 'creating'
  | 'running'
  | 'stopped'
  | 'starting'
  | 'stopping'
  | 'restarting'
  | 'reinstalling'
  | 'error'
  | 'destroyed'
  | 'unknown';

export type BillingStatus = 'active' | 'past_due' | 'cancelled' | 'expired' | 'trial';

export interface ServerActionResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  errorCode?: string;
  providerTaskId?: string;
}

export interface ServerMetrics {
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  diskUsagePercent: number;
  networkInBytesPerSec: number;
  networkOutBytesPerSec: number;
  diskReadBytesPerSec: number;
  diskWriteBytesPerSec: number;
  uptimeSeconds: number;
  timestamp: Date;
}

export interface ConsoleCredentials {
  url: string;
  token?: string;
  username?: string;
  password?: string;
  expiresAt?: Date;
  protocol?: 'vnc' | 'spice' | 'rdp' | 'serial';
}

export interface ProviderHealthCheck {
  healthy: boolean;
  latencyMs?: number;
  version?: string;
  error?: string;
  details?: Record<string, unknown>;
}

export interface OSOption {
  id: string;
  name: string;
  version: string;
  architecture: 'x86_64' | 'aarch64';
  isDefault: boolean;
}

export interface ProvisioningContext {
  orderId: string;
  userId: string;
  serverName: string;
  idempotencyKey: string;
}

export interface ProvisioningResult {
  success: boolean;
  serverId?: string;
  providerServerId?: string;
  message: string;
  errorCode?: string;
  providerTaskId?: string;
}

export interface VPSProvider {
  createServer(options: ServerCreateOptions): Promise<ServerActionResult>;
  deleteServer(serverId: string): Promise<ServerActionResult>;
  startServer(serverId: string): Promise<ServerActionResult>;
  stopServer(serverId: string, force?: boolean): Promise<ServerActionResult>;
  restartServer(serverId: string): Promise<ServerActionResult>;
  reinstallServer(serverId: string, osTemplate: string): Promise<ServerActionResult>;
  getServer(serverId: string): Promise<ServerInfo | null>;
  getServerStatus(serverId: string): Promise<ServerStatus>;
  getServerMetrics(serverId: string): Promise<ServerMetrics | null>;
  getConsole(serverId: string): Promise<ConsoleCredentials | null>;
  listServers(): Promise<ServerInfo[]>;
  getOSOptions(): Promise<OSOption[]>;
  healthCheck(): Promise<ProviderHealthCheck>;
  
  provisionServer(context: ProvisioningContext, options: ServerCreateOptions): Promise<ProvisioningResult>;
  getServerByIdempotencyKey(idempotencyKey: string): Promise<ServerInfo | null>;
}