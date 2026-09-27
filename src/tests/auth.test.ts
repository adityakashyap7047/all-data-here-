import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { hash, compare } from 'bcryptjs';
import { generateApiKey, hashApiKey, verifyApiKey } from '@/lib/auth/utils/tokens';
import { hasPermission, hasRole, ROLE_HIERARCHY, PERMISSIONS } from '@/lib/auth/utils/permissions';

describe('Authentication Utilities', () => {
  describe('Password Hashing', () => {
    it('should hash password with bcrypt', async () => {
      const password = 'securePassword123';
      const hashed = await hash(password, 12);

      expect(hashed).not.toBe(password);
      expect(hashed).toMatch(/^\$2[aby]\$\d{2}\$/);
    });

    it('should verify correct password', async () => {
      const password = 'securePassword123';
      const hashed = await hash(password, 12);
      const valid = await compare(password, hashed);

      expect(valid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'securePassword123';
      const hashed = await hash(password, 12);
      const valid = await compare('wrongPassword', hashed);

      expect(valid).toBe(false);
    });
  });

  describe('API Key Generation', () => {
    it('should generate valid API key format', async () => {
      const { key, prefix, hash: keyHash } = await generateApiKey();

      expect(key).toMatch(/^nc_[A-Za-z0-9_-]{32}$/);
      expect(prefix).toBe(key.slice(0, 12));
      expect(keyHash).toMatch(/^\$2[aby]\$\d{2}\$/);
    });

    it('should verify API key against hash', async () => {
      const { key, hash: keyHash } = await generateApiKey();
      const valid = await verifyApiKey(key, keyHash);

      expect(valid).toBe(true);
    });

    it('should reject invalid API key', async () => {
      const { hash: keyHash } = await generateApiKey();
      const valid = await verifyApiKey('nc_invalidkey', keyHash);

      expect(valid).toBe(false);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should have correct role hierarchy', () => {
      expect(ROLE_HIERARCHY.SUPER_ADMIN).toBeGreaterThan(ROLE_HIERARCHY.ADMIN);
      expect(ROLE_HIERARCHY.ADMIN).toBeGreaterThan(ROLE_HIERARCHY.SUPPORT);
      expect(ROLE_HIERARCHY.SUPPORT).toBeGreaterThan(ROLE_HIERARCHY.BILLING);
      expect(ROLE_HIERARCHY.BILLING).toBeGreaterThan(ROLE_HIERARCHY.CUSTOMER);
      expect(ROLE_HIERARCHY.CUSTOMER).toBeGreaterThan(ROLE_HIERARCHY.API);
    });

    it('should check role hierarchy correctly', () => {
      expect(hasRole('SUPER_ADMIN', 'ADMIN')).toBe(true);
      expect(hasRole('ADMIN', 'SUPER_ADMIN')).toBe(false);
      expect(hasRole('CUSTOMER', 'CUSTOMER')).toBe(true);
      expect(hasRole('CUSTOMER', 'ADMIN')).toBe(false);
    });

    it('should check permissions correctly', () => {
      expect(hasPermission('SUPER_ADMIN', 'any:permission')).toBe(true);
      expect(hasPermission('ADMIN', 'users:read')).toBe(true);
      expect(hasPermission('ADMIN', 'users:write')).toBe(true);
      expect(hasPermission('SUPPORT', 'tickets:write')).toBe(true);
      expect(hasPermission('SUPPORT', 'users:write')).toBe(false);
      expect(hasPermission('BILLING', 'invoices:write')).toBe(true);
      expect(hasPermission('BILLING', 'vps:write')).toBe(false);
      expect(hasPermission('CUSTOMER', 'vps:read:self')).toBe(true);
      expect(hasPermission('CUSTOMER', 'vps:read')).toBe(false);
      expect(hasPermission('API', 'metrics:read')).toBe(true);
    });

    it('should have expected permissions for each role', () => {
      expect(PERMISSIONS.SUPER_ADMIN).toContain('*');
      expect(PERMISSIONS.ADMIN).toContain('users:read');
      expect(PERMISSIONS.ADMIN).toContain('vps:write');
      expect(PERMISSIONS.SUPPORT).toContain('tickets:assign');
      expect(PERMISSIONS.BILLING).toContain('payments:write');
      expect(PERMISSIONS.CUSTOMER).toContain('profile:write');
      expect(PERMISSIONS.API).toContain('vps:read');
    });
  });
});

describe('Validation Schemas', () => {
  const registerSchema = require('@/lib/validators').registerSchema;
  const loginSchema = require('@/lib/validators').loginSchema;
  const resetPasswordSchema = require('@/lib/validators').resetPasswordSchema;

  describe('Register Schema', () => {
    it('should accept valid registration data', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securePass123',
        confirmPassword: 'securePass123',
      });

      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'invalid-email',
        password: 'securePass123',
        confirmPassword: 'securePass123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('email');
      }
    });

    it('should reject short password', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'short',
        confirmPassword: 'short',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('password');
      }
    });

    it('should reject mismatched passwords', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securePass123',
        confirmPassword: 'differentPass456',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('confirmPassword');
      }
    });

    it('should reject short name', () => {
      const result = registerSchema.safeParse({
        name: 'J',
        email: 'john@example.com',
        password: 'securePass123',
        confirmPassword: 'securePass123',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Login Schema', () => {
    it('should accept valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'john@example.com',
        password: 'securePass123',
      });

      expect(result.success).toBe(true);
    });

    it('should reject missing password', () => {
      const result = loginSchema.safeParse({
        email: 'john@example.com',
        password: '',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Reset Password Schema', () => {
    it('should accept valid reset data', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'newSecurePass123',
        confirmPassword: 'newSecurePass123',
      });

      expect(result.success).toBe(true);
    });

    it('should reject mismatched passwords', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'newSecurePass123',
        confirmPassword: 'differentPass456',
      });

      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'short',
        confirmPassword: 'short',
      });

      expect(result.success).toBe(false);
    });
  });
});