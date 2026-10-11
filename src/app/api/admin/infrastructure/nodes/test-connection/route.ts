import { requirePermission } from '@/lib/auth/utils/permissions';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const testConnectionSchema = z.object({
  hostname: z.string().min(1),
  sshPort: z.coerce.number().int().min(1).max(65535).default(22),
  sshUsername: z.string().min(1),
  sshPrivateKey: z.string().optional(),
  hostKeyFingerprint: z.string().optional(),
  verifyHostKey: z.boolean().default(true),
});

export async function POST(request: Request) {
  const { user, error } = await requirePermission('vps:write');
  if (error) return error;

  try {
    const body = await request.json();
    const data = testConnectionSchema.parse(body);

    const result = await testSSHConnection({
      hostname: data.hostname,
      port: data.sshPort,
      username: data.sshUsername,
      privateKey: data.sshPrivateKey,
      hostKeyFingerprint: data.hostKeyFingerprint,
      verifyHostKey: data.verifyHostKey,
    });

    await logConnectionTest(user.id, null, 'CONNECTION_TEST', result.success, result.message, result.details);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      details: result.details,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      );
    }
    console.error('Test connection error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Connection test failed' } },
      { status: 500 }
    );
  }
}

async function testSSHConnection(params: {
  hostname: string;
  port: number;
  username: string;
  privateKey?: string;
  hostKeyFingerprint?: string;
  verifyHostKey: boolean;
}) {
  const { hostname, port, username, privateKey, hostKeyFingerprint, verifyHostKey } = params;

  const sshConfig = {
    host: hostname,
    port,
    username,
    privateKey,
    readyTimeout: 10000,
    connTimeout: 10000,
    keepaliveInterval: 5000,
    keepaliveCountMax: 2,
    ...(verifyHostKey && hostKeyFingerprint
      ? {
          algorithms: {
            serverHostKey: ['ssh-rsa', 'rsa-sha2-256', 'rsa-sha2-512', 'ecdsa-sha2-nistp256', 'ssh-ed25519'],
          },
        }
      : {}),
  };

  return new Promise<{ success: boolean; message: string; details?: any }>((resolve) => {
    try {
      const { Client } = require('ssh2');
      const conn = new Client();

      const timeout = setTimeout(() => {
        conn.end();
        resolve({ success: false, message: 'Connection timeout (10s)' });
      }, 15000);

      conn.on('ready', async () => {
        clearTimeout(timeout);
        
        try {
          const systemInfo = await executeCommands(conn);
          conn.end();
          resolve({
            success: true,
            message: 'SSH connection successful',
            details: systemInfo,
          });
        } catch (err) {
          conn.end();
          resolve({ success: false, message: `Command execution failed: ${err}` });
        }
      });

      conn.on('error', (err: Error) => {
        clearTimeout(timeout);
        let message = err.message;
        if (message.includes('ECONNREFUSED')) message = 'Connection refused - check SSH port and firewall';
        else if (message.includes('ETIMEDOUT')) message = 'Connection timeout - check network/firewall';
        else if (message.includes('Authentication failed')) message = 'Authentication failed - check private key';
        else if (message.includes('Host key verification failed')) message = 'Host key mismatch - verify fingerprint';
        resolve({ success: false, message });
      });

      conn.connect(sshConfig);
    } catch (err) {
      resolve({ success: false, message: `SSH client error: ${err}` });
    }
  });
}

async function executeCommands(conn: any) {
  return new Promise<any>((resolve, reject) => {
    conn.exec('cat /etc/os-release', (err: Error, stream: any) => {
      if (err) return reject(err);
      let output = '';
      stream.on('data', (data: Buffer) => { output += data.toString(); });
      stream.on('close', () => {
        const osInfo = parseOsRelease(output);
        
        conn.exec('uname -m', (err: Error, stream: any) => {
          if (err) return reject(err);
          let arch = '';
          stream.on('data', (data: Buffer) => { arch += data.toString().trim(); });
          stream.on('close', () => {
            
            conn.exec('nproc', (err: Error, stream: any) => {
              if (err) return reject(err);
              let cpuCores = '';
              stream.on('data', (data: Buffer) => { cpuCores += data.toString().trim(); });
              stream.on('close', () => {
                
                conn.exec('free -m', (err: Error, stream: any) => {
                  if (err) return reject(err);
                  let memOutput = '';
                  stream.on('data', (data: Buffer) => { memOutput += data.toString(); });
                  stream.on('close', () => {
                    const memInfo = parseFree(memOutput);
                    
                    conn.exec('df -BG /', (err: Error, stream: any) => {
                      if (err) return reject(err);
                      let diskOutput = '';
                      stream.on('data', (data: Buffer) => { diskOutput += data.toString(); });
                      stream.on('close', () => {
                        const diskInfo = parseDf(diskOutput);
                        
                        conn.exec('java -version 2>&1', (err: Error, stream: any) => {
                          let javaVersion = '';
                          if (!err) {
                            stream.on('data', (data: Buffer) => { javaVersion += data.toString(); });
                          }
                          stream.on('close', () => {
                            
                            conn.exec('docker --version 2>&1', (err: Error, stream: any) => {
                              let dockerVersion = '';
                              if (!err) {
                                stream.on('data', (data: Buffer) => { dockerVersion += data.toString(); });
                              }
                              stream.on('close', () => {
                                resolve({
                                  os: `${osInfo.name} ${osInfo.version}`,
                                  arch: arch || 'unknown',
                                  cpuCores: parseInt(cpuCores) || 0,
                                  totalRam: memInfo.total,
                                  availableRam: memInfo.available,
                                  totalDisk: diskInfo.total,
                                  availableDisk: diskInfo.available,
                                  javaVersion: extractJavaVersion(javaVersion),
                                  dockerVersion: dockerVersion.trim() || null,
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}

function parseOsRelease(output: string) {
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

function parseFree(output: string) {
  const lines = output.trim().split('\n');
  const memLine = lines[1]?.split(/\s+/);
  if (!memLine) return { total: 0, available: 0 };
  return {
    total: parseInt(memLine[1]) || 0,
    available: parseInt(memLine[6]) || parseInt(memLine[3]) || 0,
  };
}

function parseDf(output: string) {
  const lines = output.trim().split('\n');
  const parts = lines[1]?.split(/\s+/);
  if (!parts) return { total: 0, available: 0 };
  return {
    total: parseInt(parts[1]?.replace('G', '')) * 1024 || 0,
    available: parseInt(parts[3]?.replace('G', '')) * 1024 || 0,
  };
}

function extractJavaVersion(output: string) {
  const match = output.match(/version "([^"]+)"/);
  return match ? match[1] : null;
}

async function logConnectionTest(userId: string, nodeId: string | null, eventType: string, success: boolean, message: string, details?: any) {
  try {
    const { prisma } = await import('@/lib/prisma');
    await prisma.vPSNodeConnectionLog.create({
      data: {
        nodeId: nodeId || 'test',
        eventType,
        success,
        message,
        details,
        createdBy: userId,
      },
    });
  } catch (err) {
    console.error('Failed to log connection test:', err);
  }
}