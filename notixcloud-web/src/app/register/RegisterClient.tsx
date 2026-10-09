'use client';

import { useState } from 'react';
import { Mail, Lock, User, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterClient() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 12) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

  const onSubmit = async (data: RegisterFormData) => {
    setSubmitStatus('submitting');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      setSubmitStatus('success');
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 2000);
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-slate-50 dark:bg-slate-950">
      <Container size="sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6" aria-label="NOTIXCLOUD Home">
            <svg className="h-10 w-10 text-indigo-600 dark:text-indigo-400" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="currentColor" />
              <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">NOTIXCLOUD</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Your Account</h1>
          <p className="text-slate-600 dark:text-slate-400">Start deploying infrastructure in minutes</p>
        </div>

        <Card variant="bordered">
          <CardContent className="pt-6">
            {submitStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Account Created!</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Welcome to NOTIXCLOUD. Please check your email to verify your account.
                </p>
                <Link href="/login">
                  <Button>Sign In Now</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                {errorMessage && (
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3" role="alert">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    placeholder="John"
                    error={errors.firstName?.message}
                    icon={<User className="h-5 w-5" />}
                    {...register('firstName')}
                    autoComplete="given-name"
                  />
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    error={errors.lastName?.message}
                    icon={<User className="h-5 w-5" />}
                    {...register('lastName')}
                    autoComplete="family-name"
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  icon={<Mail className="h-5 w-5" />}
                  {...register('email')}
                  autoComplete="email"
                />

                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                    error={errors.password?.message}
                    icon={<Lock className="h-5 w-5" />}
                    {...register('password')}
                    autoComplete="new-password"
                    aria-describedby="password-requirements"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[38px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {password && (
                  <div id="password-requirements" className="space-y-2" aria-live="polite">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full transition-all duration-300', strengthColors[strength - 1] || 'bg-red-500')}
                          style={{ width: `${(strength / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-24">
                        {strengthLabels[strength - 1] || 'Very Weak'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className={cn('flex items-center gap-1', password.length >= 12 ? 'text-green-600 dark:text-green-400' : '')}>
                        <CheckCircle className="h-3 w-3" aria-hidden="true" /> 12+ chars
                      </span>
                      <span className={cn('flex items-center gap-1', /[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : '')}>
                        <CheckCircle className="h-3 w-3" aria-hidden="true" /> Uppercase
                      </span>
                      <span className={cn('flex items-center gap-1', /[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : '')}>
                        <CheckCircle className="h-3 w-3" aria-hidden="true" /> Lowercase
                      </span>
                      <span className={cn('flex items-center gap-1', /[0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : '')}>
                        <CheckCircle className="h-3 w-3" aria-hidden="true" /> Number
                      </span>
                      <span className={cn('flex items-center gap-1', /[^A-Za-z0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : '')}>
                        <CheckCircle className="h-3 w-3" aria-hidden="true" /> Special char
                      </span>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <Input
                    label="Confirm Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                    error={errors.confirmPassword?.message}
                    icon={<Lock className="h-5 w-5" />}
                    {...register('confirmPassword')}
                    autoComplete="new-password"
                  />
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="h-4 w-4 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    {...register('termsAccepted')}
                  />
                  <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400">
                    I agree to the <a href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</a>
                  </label>
                </div>

                {errors.termsAccepted && (
                  <p className="text-sm text-red-600 dark:text-red-400" role="alert">{errors.termsAccepted.message}</p>
                )}

                <Button type="submit" className="w-full" loading={submitStatus === 'submitting'}>
                  {submitStatus === 'submitting' ? 'Creating Account...' : 'Create Account'}
                </Button>

                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                  Already have an account?{' '}
                  <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                    Sign In
                  </Link>
                </p>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-4">Or continue with</p>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => window.open('https://github.com/login/oauth/authorize', '_blank')} disabled>
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </Button>
                <Button variant="outline" onClick={() => window.open('https://accounts.google.com/o/oauth2/auth', '_blank')} disabled>
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}