export interface NodeAgentConfig {
  nodeId: string;
  nodeName: string;
  controlPanelUrl: string;
  agentToken: string;
  tlsCertPath?: string;
  tlsKeyPath?: string;
  caCertPath?: string;
  verifyTls: boolean;
  heartbeatInterval: number;
  commandTimeout: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  dataDir: string;
  serversDir: string;
  backupsDir: string;
  tempDir: string;
  maxConcurrentOperations: number;
  allowedCommands: string[];
  blockedCommands: string[];
}

export interface NodeRegistrationRequest {
  nodeId: string;
  name: string;
  hostname: string;
  sshPort: number;
  sshUsername: string;
  os: string;
  arch: string;
  cpuCores: number;
  totalRam: number;
  totalDisk: number;
  javaVersion: string | null;
  dockerVersion: string | null;
  publicKey: string;
  capabilities: string[];
}

export interface NodeRegistrationResponse {
  success: boolean;
  agentToken: string;
  agentTokenExpiry: string;
  config: Partial<NodeAgentConfig>;
  error?: string;
}

export interface HealthCheckRequest {
  nodeId: string;
  timestamp: string;
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
  loadAverage: number | null;
  uptime: number;
  runningServers: number;
  javaVersion: string | null;
  dockerVersion: string | null;
}

export interface HealthCheckResponse {
  success: boolean;
  commands?: AgentCommand[];
  configUpdate?: Partial<NodeAgentConfig>;
  error?: string;
}

export interface AgentCommand {
  id: string;
  type: 'deploy' | 'start' | 'stop' | 'restart' | 'reinstall' | 'backup' | 'update' | 'config' | 'custom';
  serverId?: string;
  payload: Record<string, any>;
  timeout: number;
  retryCount: number;
  createdAt: string;
}

export interface AgentCommandResult {
  commandId: string;
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
  duration: number;
  completedAt: string;
}

export interface ServerDeployPayload {
  serverId: string;
  name: string;
  version: string;
  softwareType: string;
  allocatedCpu: number;
  allocatedRam: number;
  allocatedDisk: number;
  port: number;
  javaArgs: string;
  serverProperties: Record<string, string>;
  worldName: string;
  maxPlayers: number;
  motd: string;
}

export interface ServerControlPayload {
  serverId: string;
  action: 'start' | 'stop' | 'restart' | 'kill';
  timeout?: number;
}

export interface ServerBackupPayload {
  serverId: string;
  backupName: string;
  includeWorld: boolean;
  includeConfig: boolean;
  includePlugins: boolean;
}

export interface ServerLogsPayload {
  serverId: string;
  lines: number;
  follow: boolean;
}

export interface AgentMetrics {
  timestamp: string;
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
  loadAverage: number | null;
  activeConnections: number;
  queuedCommands: number;
}

export interface AgentEvent {
  type: 'startup' | 'shutdown' | 'server_event' | 'health_check' | 'command_result' | 'error';
  timestamp: string;
  severity: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  details?: Record<string, any>;
}

export const AGENT_PROTOCOL_VERSION = '1.0';
export const DEFAULT_HEARTBEAT_INTERVAL = 30000;
export const DEFAULT_COMMAND_TIMEOUT = 300000;
export const MAX_COMMAND_RETRIES = 3;

export const ALLOWED_COMMANDS = [
  'java',
  'systemctl',
  'service',
  'docker',
  'tar',
  'gzip',
  'gunzip',
  'rsync',
  'scp',
  'curl',
  'wget',
  'unzip',
  'chmod',
  'chown',
  'mkdir',
  'rm',
  'cp',
  'mv',
  'ln',
  'cat',
  'echo',
  'grep',
  'sed',
  'awk',
  'tail',
  'head',
  'wc',
  'df',
  'free',
  'uptime',
  'ps',
  'kill',
  'pkill',
];

export const BLOCKED_COMMANDS = [
  'rm -rf /',
  'mkfs',
  'fdisk',
  'dd',
  'shutdown',
  'reboot',
  'halt',
  'poweroff',
  'init 0',
  'init 6',
  'useradd',
  'userdel',
  'usermod',
  'passwd',
  'su',
  'sudo',
  'visudo',
  'iptables',
  'ufw',
  'firewall-cmd',
  'systemctl disable',
  'systemctl mask',
  'crontab -r',
  '> /dev/sda',
  'dd if=/dev/zero',
  ':(){ :|:& };:',  // Fork bomb
];

export function validateCommand(command: string): { allowed: boolean; reason?: string } {
  const baseCommand = command.trim().split(' ')[0];
  
  if (BLOCKED_COMMANDS.some(b => command.includes(b))) {
    return { allowed: false, reason: 'Command matches blocked pattern' };
  }
  
  if (!ALLOWED_COMMANDS.includes(baseCommand)) {
    return { allowed: false, reason: `Command '${baseCommand}' not in allowed list` };
  }
  
  return { allowed: true };
}