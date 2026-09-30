'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const passwordRequirements = [
  { label: 'At least 12 characters', test: (p: string) => p.length >= 12 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters')
    .refine(
      (password) => {
        return passwordRequirements.every(req => req.test(password));
      },
      { message: 'Password does not meet complexity requirements' }
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-notix-bg">
        <Loader2 className="w-8 h-8 animate-spin text-notix-accent" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch('password', '');

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, token }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error?.message || 'Reset failed');
        return;
      }

      toast.success(result.message);
      router.push('/login?reset=true');
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-notix-bg px-4 py-12">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-notix-accent to-blue-500 flex items-center justify-center">
              <span className="text-notix-bg font-bold text-xl">N</span>
            </div>
            <span className="text-2xl font-bold text-notix-text">NOTIXCLOUD</span>
          </Link>
          <div className="card-base">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-notix-text mb-2">Invalid reset link</h1>
            <p className="text-notix-textMuted mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Button variant="outline" onClick={() => router.push('/forgot-password')}>
              Request new link
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-notix-bg px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-notix-accent to-blue-500 flex items-center justify-center">
              <span className="text-notix-bg font-bold text-xl">N</span>
            </div>
            <span className="text-2xl font-bold text-notix-text">NOTIXCLOUD</span>
          </Link>
          <h1 className="text-3xl font-bold text-notix-text">Reset password</h1>
          <p className="text-notix-textMuted mt-2">Enter your new password below</p>
        </div>

        <div className="card-base">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-notix-text">
                New Password
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-notix-textMuted" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  {...register('password')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-notix-textMuted hover:text-notix-text"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              {password && (
                <div className="mt-2 p-3 bg-notix-bg rounded-lg border border-white/5">
                  <p className="text-xs text-notix-textMuted mb-2">Password strength:</p>
                  <div className="space-y-1">
                    {passwordRequirements.map((req, i) => {
                      const met = req.test(password);
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <CheckCircle
                            className={cn(
                              'w-3 h-3 flex-shrink-0',
                              met ? 'text-green-400' : 'text-notix-textMuted/30'
                            )}
                          />
                          <span className={cn(met ? 'text-green-400' : 'text-notix-textMuted')}>
                            {req.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-notix-text">
                Confirm New Password
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-notix-textMuted" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10"
                  {...register('confirmPassword')}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Resetting...
                </>
              ) : (
                'Reset password'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-notix-textMuted mt-6">
          <Link href="/login" className="text-notix-accent hover:underline font-medium">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}