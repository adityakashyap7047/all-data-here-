import { z } from 'zod';
import { passwordRequirements, validatePasswordStrength } from '@/lib/utils/security';

const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')
  .refine(
    (password) => {
      const result = validatePasswordStrength(password);
      return result.valid;
    },
    { message: 'Password does not meet complexity requirements' }
  );

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  twoFactorCode: z.string().length(6).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const vpsOrderSchema = z.object({
  planId: z.string().cuid(),
  hostname: z.string().min(3).max(64).regex(/^[a-zA-Z0-9-]+$/),
  osTemplate: z.string().min(1),
  sshKeyId: z.string().optional(),
  billingCycle: z.enum(['monthly', 'yearly']),
  addons: z.array(z.object({
    id: z.string(),
    quantity: z.number().int().positive(),
  })).optional(),
});

export const ticketSchema = z.object({
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(10000),
  category: z.enum(['GENERAL', 'BILLING', 'TECHNICAL', 'VPS', 'NETWORK', 'SECURITY', 'ABUSE', 'SALES', 'FEATURE_REQUEST']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']).default('NORMAL'),
});

export const ticketMessageSchema = z.object({
  message: z.string().min(1).max(10000),
});

export const apiKeySchema = z.object({
  name: z.string().min(3).max(50),
  permissions: z.array(z.string()).min(1),
  expiresAt: z.date().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const twoFactorSchema = z.object({
  code: z.string().length(6, '2FA code must be 6 digits'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VPSOrderInput = z.infer<typeof vpsOrderSchema>;
export type TicketInput = z.infer<typeof ticketSchema>;
export type TicketMessageInput = z.infer<typeof ticketMessageSchema>;
export type ApiKeyInput = z.infer<typeof apiKeySchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type TwoFactorInput = z.infer<typeof twoFactorSchema>;