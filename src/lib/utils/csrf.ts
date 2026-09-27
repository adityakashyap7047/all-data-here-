import { NextRequest, NextResponse } from 'next/server';

const csrfTokens = new Map<string, { token: string; expires: number }>();

export function generateCsrfToken(sessionId: string): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  
  csrfTokens.set(sessionId, {
    token,
    expires: Date.now() + 24 * 60 * 60 * 1000,
  });
  
  return token;
}

export function validateCsrfToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  
  if (!stored) return false;
  if (stored.expires < Date.now()) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  if (stored.token.length !== token.length) return false;
  
  let result = 0;
  for (let i = 0; i < stored.token.length; i++) {
    result |= stored.token.charCodeAt(i) ^ token.charCodeAt(i);
  }
  
  return result === 0;
}

export function csrfProtection(request: NextRequest): { valid: boolean; error?: NextResponse } {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return { valid: true };
  }

  const sessionId = request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__session')?.value;
  
  if (!sessionId) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: { code: 'CSRF_MISSING_SESSION', message: 'Session required for CSRF validation' } },
        { status: 401 }
      ),
    };
  }

  const token = request.headers.get('x-csrf-token') ||
    request.headers.get('csrf-token');
  
  if (!token) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: { code: 'CSRF_MISSING_TOKEN', message: 'CSRF token required' } },
        { status: 403 }
      ),
    };
  }

  if (!validateCsrfToken(sessionId, token)) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: { code: 'CSRF_INVALID_TOKEN', message: 'Invalid CSRF token' } },
        { status: 403 }
      ),
    };
  }

  return { valid: true };
}

export function cleanupCsrfTokens(): void {
  const now = Date.now();
  for (const [key, value] of csrfTokens.entries()) {
    if (value.expires < now) {
      csrfTokens.delete(key);
    }
  }
}

setInterval(cleanupCsrfTokens, 60 * 60 * 1000);