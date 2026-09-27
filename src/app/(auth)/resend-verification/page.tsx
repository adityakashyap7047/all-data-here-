'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ResendVerificationForm = z.infer<typeof resendVerificationSchema>;

export default function ResendVerificationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendVerificationForm>({
    resolver: zodResolver(resendVerificationSchema),
  });

  const onSubmit = async (data: ResendVerificationForm) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error?.message || 'Request failed');
        return;
      }

      toast.success(result.message);
      setIsSubmitted(true);
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
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
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-notix-text mb-2">Email sent!</h1>
            <p className="text-notix-textMuted mb-6">
              If an account exists, we've sent a new verification link to your email.
            </p>
            <Button variant="outline" onClick={() => router.push('/login')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
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
          <h1 className="text-3xl font-bold text-notix-text">Resend verification</h1>
          <p className="text-notix-textMuted mt-2">Enter your email to receive a new verification link</p>
        </div>

        <div className="card-base">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-notix-text">
                Email
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-notix-textMuted" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                'Send verification email'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-notix-textMuted mt-6">
          <Link href="/login" className="text-notix-accent hover:underline font-medium">
            <ArrowLeft className="w-4 h-4 inline mr-1" />
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}