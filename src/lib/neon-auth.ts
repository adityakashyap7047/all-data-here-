import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

const jwksUrl = process.env.NEON_JWKS_URL!;
const audience = process.env.NEON_AUTH_AUDIENCE!;
const issuer = process.env.NEON_AUTH_URL!;

const JWKS = createRemoteJWKSet(new URL(jwksUrl));

export interface NeonUser extends JWTPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  role?: string;
  two_factor_enabled?: boolean;
  session_id?: string;
}

export async function verifyNeonToken(token: string): Promise<NeonUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer,
      audience,
    });
    return payload as NeonUser;
  } catch {
    return null;
  }
}

export async function getNeonUserFromRequest(request: Request): Promise<NeonUser | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7);
  return verifyNeonToken(token);
}

export async function getNeonUserFromCookie(request: Request): Promise<NeonUser | null> {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const neonCookie = cookies.find(c => c.startsWith('neon_auth_token='));
  if (!neonCookie) return null;

  const token = neonCookie.split('=')[1];
  return verifyNeonToken(token);
}

export function createNeonAuthUrl(callbackUrl: string): string {
  const baseUrl = process.env.NEON_AUTH_URL!;
  const params = new URLSearchParams({
    callback_url: callbackUrl,
  });
  return `${baseUrl}/signin?${params.toString()}`;
}

export function createNeonSignUpUrl(callbackUrl: string): string {
  const baseUrl = process.env.NEON_AUTH_URL!;
  const params = new URLSearchParams({
    callback_url: callbackUrl,
  });
  return `${baseUrl}/signup?${params.toString()}`;
}

export function createNeonSignOutUrl(callbackUrl: string): string {
  const baseUrl = process.env.NEON_AUTH_URL!;
  const params = new URLSearchParams({
    callback_url: callbackUrl,
  });
  return `${baseUrl}/signout?${params.toString()}`;
}