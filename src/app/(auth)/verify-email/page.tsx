'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-notix-bg">
        <Loader2 className="w-8 h-8 animate-spin text-notix-accent" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (!response.ok) {
          setStatus('error');
          setMessage(result.error?.message || 'Verification failed');
          return;
        }

        setStatus('success');
        setMessage(result.message);
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred. Please try again.');
      }
    };

    verifyEmail();
  }, [token]);

  if (status === 'loading') {
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
            <div className="w-16 h-16 rounded-full bg-notix-accent/10 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-notix-accent animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-notix-text mb-2">Verifying your email</h1>
            <p className="text-notix-textMuted">Please wait while we verify your email address...</p>
          </div>
        </div>
      </div>
    );
  }

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
          {status === 'success' ? (
            <>
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-notix-text mb-2">Email verified!</h1>
              <p className="text-notix-textMuted mb-6">{message}</p>
              <Button onClick={() => router.push('/login?verified=true')}>
                Sign in to your account
              </Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-notix-text mb-2">Verification failed</h1>
              <p className="text-notix-textMuted mb-6">{message}</p>
              <div className="space-y-2">
                <Button variant="outline" onClick={() => router.push('/auth/resend-verification')}>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend verification email
                </Button>
                <Button variant="ghost" onClick={() => router.push('/register')}>
                  Create new account
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}