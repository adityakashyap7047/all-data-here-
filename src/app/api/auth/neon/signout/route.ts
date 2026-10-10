import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const callbackUrl = searchParams.get('callback_url') || '/';

  const cookieStore = await cookies();
  cookieStore.delete('neon_auth_token');

  const redirectUrl = new URL(callbackUrl, request.url);
  return NextResponse.redirect(redirectUrl);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { callback_url } = body;

    const cookieStore = await cookies();
    cookieStore.delete('neon_auth_token');

    return NextResponse.json({ success: true, redirect: callback_url || '/' });
  } catch {
    return NextResponse.json({ error: 'Sign out failed' }, { status: 500 });
  }
}