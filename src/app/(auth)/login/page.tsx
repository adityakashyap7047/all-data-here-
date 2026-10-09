'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Github, Mail, Lock, Eye, EyeOff, Loader2, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: false },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Welcome back!');
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: string) => {
    signIn(provider, { callbackUrl });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-red-600/[0.05] blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Diagonal lines */}
        <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-red-600/10 to-transparent" />
        <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-red-600/10 to-transparent" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & heading */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]">
              <Server className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              NOTIX<span className="text-red-500">CLOUD</span>
            </span>
          </Link>
          <h1 className="text-4xl font-black text-white tracking-tight">Welcome back</h1>
          <p className="text-white/40 mt-3 text-sm">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm">
          <div className="space-y-5">
            {/* OAuth buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleOAuthSignIn('github')}
                disabled={isLoading}
                className="h-12 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/50 hover:text-white hover:border-red-600/30 hover:bg-red-600/[0.05] transition-all duration-300 disabled:opacity-50"
              >
                <Github className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
                className="h-12 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/50 hover:text-white hover:border-red-600/30 hover:bg-red-600/[0.05] transition-all duration-300 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </button>
              <button
                onClick={() => handleOAuthSignIn('discord')}
                disabled={isLoading}
                className="h-12 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/50 hover:text-white hover:border-red-600/30 hover:bg-red-600/[0.05] transition-all duration-300 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.38-.422.768-.642 1.162a19.279 19.279 0 0 0-5.397 0 12.34 12.34 0 0 0-.639-1.162.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.681 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.083.083 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.079.079 0 0 0 .084-.028 13.29 13.29 0 0 0 .636-1.157 19.18 19.18 0 0 0 5.187 0 13.28 13.28 0 0 0 .637 1.157.079.079 0 0 0 .084.028c1.993-.73 3.898-1.748 5.542-3.083a.079.079 0 0 0 .032-.054c.269-3.243-.164-7.526-1.27-11.876a.061.061 0 0 0-.013-.068.086.086 0 0 0-.056-.022ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
                  />
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black/80 px-4 text-white/30 tracking-widest">Or continue with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-xs font-bold text-white/60 uppercase tracking-wider">
                  Email
                </Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/10 transition-all duration-300 disabled:opacity-50"
                    {...register('email')}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="mt-2 text-xs text-red-400 font-medium">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold text-white/60 uppercase tracking-wider">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-red-500/70 hover:text-red-400 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/10 transition-all duration-300 disabled:opacity-50"
                    {...register('password')}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {errors.password && (
                    <p className="mt-2 text-xs text-red-400 font-medium">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox {...register('remember')} />
                  <span className="text-sm text-white/40">Remember me</span>
                </Label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-red-600 text-white font-bold uppercase tracking-wider text-sm transition-all duration-300 hover:bg-red-500 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-white/30 mt-8">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-red-500 hover:text-red-400 font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}