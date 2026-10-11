import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;
const TAG_LENGTH = 16;

interface EncryptedData {
  encrypted: string;
  iv: string;
  salt: string;
  tag: string;
  version: number;
}

export async function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return scryptAsync(password, salt, KEY_LENGTH) as Promise<Buffer>;
}

export async function encryptPrivateKey(
  privateKey: string,
  masterPassword: string
): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = await deriveKey(masterPassword, salt);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  cipher.setAAD(Buffer.from('notixcloud-ssh-key', 'utf8'));

  const encrypted = Buffer.concat([
    cipher.update(privateKey, 'utf8'),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  const result: EncryptedData = {
    encrypted: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    salt: salt.toString('base64'),
    tag: tag.toString('base64'),
    version: 1,
  };

  return JSON.stringify(result);
}

export async function decryptPrivateKey(
  encryptedData: string,
  masterPassword: string
): Promise<string> {
  let parsed: EncryptedData;

  try {
    parsed = JSON.parse(encryptedData);
  } catch {
    throw new Error('Invalid encrypted data format');
  }

  if (parsed.version !== 1) {
    throw new Error(`Unsupported encryption version: ${parsed.version}`);
  }

  const salt = Buffer.from(parsed.salt, 'base64');
  const iv = Buffer.from(parsed.iv, 'base64');
  const tag = Buffer.from(parsed.tag, 'base64');
  const encrypted = Buffer.from(parsed.encrypted, 'base64');
  const key = await deriveKey(masterPassword, salt);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  decipher.setAAD(Buffer.from('notixcloud-ssh-key', 'utf8'));

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

export async function rotateEncryptionKey(
  encryptedData: string,
  oldPassword: string,
  newPassword: string
): Promise<string> {
  const decrypted = await decryptPrivateKey(encryptedData, oldPassword);
  return encryptPrivateKey(decrypted, newPassword);
}

export function generateMasterKey(): string {
  return randomBytes(32).toString('base64');
}

export function validatePrivateKeyFormat(key: string): { valid: boolean; error?: string } {
  const trimmed = key.trim();
  
  if (!trimmed) {
    return { valid: false, error: 'Private key is empty' };
  }

  const openSSHPattern = /^-----BEGIN (?:OPENSSH|RSA|DSA|EC|ED25519) PRIVATE KEY-----/;
  const pkcs8Pattern = /^-----BEGIN PRIVATE KEY-----/;

  if (!openSSHPattern.test(trimmed) && !pkcs8Pattern.test(trimmed)) {
    return { valid: false, error: 'Invalid private key format. Expected OpenSSH or PKCS#8 format.' };
  }

  if (!trimmed.includes('-----END')) {
    return { valid: false, error: 'Private key missing END boundary' };
  }

  return { valid: true };
}

export function extractPublicKey(privateKey: string): string {
  const { spawnSync } = require('child_process');
  
  const result = spawnSync('ssh-keygen', ['-y', '-f', '/dev/stdin'], {
    input: privateKey,
    encoding: 'utf8',
  });

  if (result.error || result.status !== 0) {
    throw new Error(`Failed to extract public key: ${result.stderr || result.error}`);
  }

  return result.stdout.trim();
}

export async function generateKeyPair(
  type: 'ed25519' | 'rsa' = 'ed25519',
  bits: number = 2048
): Promise<{ privateKey: string; publicKey: string }> {
  const { spawnSync } = require('child_process');
  
  const args = type === 'ed25519' 
    ? ['-t', 'ed25519', '-N', '', '-f', '/dev/stdout']
    : ['-t', 'rsa', '-b', bits.toString(), '-N', '', '-f', '/dev/stdout'];

  const result = spawnSync('ssh-keygen', args, {
    encoding: 'utf8',
  });

  if (result.error || result.status !== 0) {
    throw new Error(`Failed to generate key pair: ${result.stderr || result.error}`);
  }

  const output = result.stdout;
  const privateKeyMatch = output.match(/-----BEGIN OPENSSH PRIVATE KEY-----[\s\S]*?-----END OPENSSH PRIVATE KEY-----/);
  const publicKeyMatch = output.match(/ssh-(?:ed25519|rsa) [A-Za-z0-9+/]+=?=?/);

  if (!privateKeyMatch || !publicKeyMatch) {
    throw new Error('Failed to parse generated key pair');
  }

  return {
    privateKey: privateKeyMatch[0],
    publicKey: publicKeyMatch[0],
  };
}

export function fingerprintPublicKey(publicKey: string): string {
  const crypto = require('crypto');
  
  const keyData = publicKey.split(' ')[1];
  if (!keyData) throw new Error('Invalid public key format');
  
  const keyBuffer = Buffer.from(keyData, 'base64');
  const hash = crypto.createHash('sha256').update(keyBuffer).digest();
  
  return 'SHA256:' + hash.toString('base64').replace(/=+$/, '');
}

export function fingerprintPublicKeyMD5(publicKey: string): string {
  const crypto = require('crypto');
  
  const keyData = publicKey.split(' ')[1];
  if (!keyData) throw new Error('Invalid public key format');
  
  const keyBuffer = Buffer.from(keyData, 'base64');
  const hash = crypto.createHash('md5').update(keyBuffer).digest('hex');
  
  return hash.match(/.{2}/g)?.join(':') || '';
}

export async function verifyHostKey(
  hostname: string,
  port: number,
  expectedFingerprint?: string
): Promise<{ verified: boolean; fingerprint: string; algorithm: string }> {
  const { spawnSync } = require('child_process');
  
  const args = ['-t', 'rsa,ecdsa,ed25519', `${hostname}:${port}`];
  const result = spawnSync('ssh-keyscan', args, { encoding: 'utf8' });

  if (result.error || result.status !== 0) {
    throw new Error(`ssh-keyscan failed: ${result.stderr || result.error}`);
  }

  const output = result.stdout.trim();
  if (!output) {
    throw new Error('No host keys found');
  }

  const lines = output.split('\n');
  const fingerprints: Array<{ fingerprint: string; algorithm: string }> = [];

  for (const line of lines) {
    const parts = line.trim().split(' ');
    if (parts.length >= 3) {
      const keyData = parts[2];
      const keyBuffer = Buffer.from(keyData, 'base64');
      
      const crypto = require('crypto');
      const sha256 = crypto.createHash('sha256').update(Buffer.from(keyData, 'base64')).digest();
      const fingerprint = 'SHA256:' + sha256.toString('base64').replace(/=+$/, '');
      
      const algorithm = parts[1];
      fingerprints.push({ fingerprint, algorithm });
    }
  }

  if (expectedFingerprint) {
    const matched = fingerprints.some(f => f.fingerprint === expectedFingerprint);
    return {
      verified: matched,
      fingerprint: fingerprints[0]?.fingerprint || '',
      algorithm: fingerprints[0]?.algorithm || 'unknown',
    };
  }

  return {
    verified: false,
    fingerprint: fingerprints[0]?.fingerprint || '',
    algorithm: fingerprints[0]?.algorithm || 'unknown',
  };
}

export function maskPrivateKey(key: string): string {
  const lines = key.trim().split('\n');
  if (lines.length <= 4) return '••••••••••••••••••••••••••••••••••••';
  
  return [
    lines[0],
    '••••••••••••••••••••••••••••••••••••',
    lines[lines.length - 1],
  ].join('\n');
}

export function sanitizeForLog(data: any): any {
  if (typeof data === 'string') {
    return data
      .replace(/-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+ PRIVATE KEY-----/g, '[REDACTED PRIVATE KEY]')
      .replace(/ssh-(?:ed25519|rsa) [A-Za-z0-9+/]+=?=?/g, '[REDACTED PUBLIC KEY]')
      .replace(/[a-f0-9]{64}/g, '[REDACTED HASH]')
      .replace(/[a-f0-9]{32}/g, '[REDACTED HASH]')
      .replace(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, '[REDACTED JWT]');
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeForLog);
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (
        key.toLowerCase().includes('key') ||
        key.toLowerCase().includes('secret') ||
        key.toLowerCase().includes('password') ||
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('private')
      ) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeForLog(value);
      }
    }
    return sanitized;
  }
  
  return data;
}