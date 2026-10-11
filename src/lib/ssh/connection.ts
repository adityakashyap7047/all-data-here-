import { Client, ConnectConfig } from 'ssh2';
import { decryptPrivateKey } from './encryption';

export interface SSHConnectionOptions {
  hostname: string;
  port: number;
  username: string;
  privateKey: string;
  passphrase?: string;
  hostKeyFingerprint?: string;
  verifyHostKey: boolean;
  readyTimeout: number;
  connTimeout: number;
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

export interface SystemInfo {
  os: string;
  arch: string;
  cpuCores: number;
  totalRam: number;
  availableRam: number;
  totalDisk: number;
  availableDisk: number;
  javaVersion: string | null;
  dockerVersion: string | null;
  loadAverage: number | null;
}

export class SSHConnection {
  private client: Client;
  private connected: boolean = false;
  private masterPassword: string;

  constructor(masterPassword: string) {
    this.masterPassword = masterPassword;
    this.client = new Client();
  }

  async connect(options: SSHConnectionOptions): Promise<void> {
    const decryptedKey = await decryptPrivateKey(options.privateKey, this.masterPassword);

    const config: ConnectConfig = {
      host: options.hostname,
      port: options.port,
      username: options.username,
      privateKey: decryptedKey,
      passphrase: options.passphrase,
      readyTimeout: options.readyTimeout,
      connTimeout: options.connTimeout,
      keepaliveInterval: 5000,
      keepaliveCountMax: 2,
      algorithms: {
        kex: [
          'curve25519-sha256',
          'curve25519-sha256@libssh.org',
          'diffie-hellman-group16-sha512',
          'diffie-hellman-group18-sha512',
        ],
        cipher: [
          'chacha20-poly1305@openssh.com',
          'aes256-gcm@openssh.com',
          'aes128-gcm@openssh.com',
          'aes256-ctr',
          'aes192-ctr',
          'aes128-ctr',
        ],
        serverHostKey: [
          'ssh-ed25519',
          'ecdsa-sha2-nistp256',
          'ecdsa-sha2-nistp384',
          'rsa-sha2-256',
          'rsa-sha2-512',
        ],
      },
    };

    if (options.verifyHostKey && options.hostKeyFingerprint) {
      config.hostVerifier = (key: Buffer) => {
        const crypto = require('crypto');
        const fingerprint = crypto.createHash('sha256').update(key).digest('base64').replace(/=+$/, '');
        const expected = options.hostKeyFingerprint!.replace('SHA256:', '');
        return fingerprint === expected;
      };
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.client.end();
        reject(new Error('Connection timeout'));
      }, options.connTimeout);

      this.client.on('ready', () => {
        clearTimeout(timeout);
        this.connected = true;
        resolve();
      });

      this.client.on('error', (err: Error) => {
        clearTimeout(timeout);
        this.connected = false;
        reject(err);
      });

      this.client.connect(config);
    });
  }

  async executeCommand(command: string, timeout: number = 30000): Promise<CommandResult> {
    if (!this.connected) {
      throw new Error('Not connected');
    }

    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const cmdTimeout = setTimeout(() => {
        reject(new Error(`Command timeout after ${timeout}ms`));
      }, timeout);

      this.client.exec(command, (err, stream) => {
        if (err) {
          clearTimeout(cmdTimeout);
          reject(err);
          return;
        }

        let stdout = '';
        let stderr = '';

        stream.on('data', (data: Buffer) => {
          stdout += data.toString();
        });

        stream.stderr.on('data', (data: Buffer) => {
          stderr += data.toString();
        });

        stream.on('close', (code: number) => {
          clearTimeout(cmdTimeout);
          const duration = Date.now() - startTime;
          resolve({
            stdout,
            stderr,
            exitCode: code,
            duration,
          });
        });
      });
    });
  }

  async executeCommands(commands: string[]): Promise<CommandResult[]> {
    const results: CommandResult[] = [];
    for (const cmd of commands) {
      results.push(await this.executeCommand(cmd));
    }
    return results;
  }

  async getSystemInfo(): Promise<SystemInfo> {
    const commands = [
      'cat /etc/os-release',
      'uname -m',
      'nproc',
      'free -m',
      'df -BG /',
      'java -version 2>&1',
      'docker --version 2>&1',
      'uptime',
    ];

    const results = await this.executeCommands(commands);

    const osInfo = this.parseOsRelease(results[0].stdout);
    const arch = results[1].stdout.trim();
    const cpuCores = parseInt(results[2].stdout.trim()) || 0;
    const memInfo = this.parseFree(results[3].stdout);
    const diskInfo = this.parseDf(results[4].stdout);
    const javaVersion = this.extractJavaVersion(results[5].stdout);
    const dockerVersion = results[6].stdout.trim() || null;
    const loadAverage = this.parseUptime(results[7].stdout);

    return {
      os: `${osInfo.name} ${osInfo.version}`,
      arch: arch || 'unknown',
      cpuCores,
      totalRam: memInfo.total,
      availableRam: memInfo.available,
      totalDisk: diskInfo.total,
      availableDisk: diskInfo.available,
      javaVersion,
      dockerVersion: dockerVersion || null,
      loadAverage,
    };
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.executeCommand('echo "connection test"', 5000);
      return { success: true, message: 'SSH connection successful' };
    } catch (err) {
      return { success: false, message: `Connection test failed: ${err}` };
    }
  }

  disconnect(): void {
    if (this.connected) {
      this.client.end();
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  private parseOsRelease(output: string) {
    const lines = output.split('\n');
    const info: Record<string, string> = {};
    for (const line of lines) {
      const [key, value] = line.split('=');
      if (key && value) info[key] = value.replace(/"/g, '');
    }
    return {
      name: info.PRETTY_NAME || info.NAME || 'Unknown',
      version: info.VERSION_ID || info.VERSION || 'Unknown',
    };
  }

  private parseFree(output: string) {
    const lines = output.trim().split('\n');
    const memLine = lines[1]?.split(/\s+/);
    if (!memLine) return { total: 0, available: 0 };
    return {
      total: parseInt(memLine[1]) || 0,
      available: parseInt(memLine[6]) || parseInt(memLine[3]) || 0,
    };
  }

  private parseDf(output: string) {
    const lines = output.trim().split('\n');
    const parts = lines[1]?.split(/\s+/);
    if (!parts) return { total: 0, available: 0 };
    return {
      total: parseInt(parts[1]?.replace('G', '')) * 1024 || 0,
      available: parseInt(parts[3]?.replace('G', '')) * 1024 || 0,
    };
  }

  private extractJavaVersion(output: string) {
    const match = output.match(/version "([^"]+)"/);
    return match ? match[1] : null;
  }

  private parseUptime(output: string) {
    const match = output.match(/load average: ([\d.]+)/);
    return match ? parseFloat(match[1]) : null;
  }
}

export async function createSSHConnection(
  masterPassword: string,
  options: SSHConnectionOptions
): Promise<SSHConnection> {
  const conn = new SSHConnection(masterPassword);
  await conn.connect(options);
  return conn;
}