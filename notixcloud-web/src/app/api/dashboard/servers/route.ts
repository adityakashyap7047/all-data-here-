import { NextResponse } from 'next/server';
import { createVPSProvider } from '@/lib/providers';

const provider = createVPSProvider({
  type: 'mock',
});

export async function GET() {
  try {
    const servers = await provider.listServers();
    return NextResponse.json({ servers });
  } catch (error) {
    console.error('Dashboard servers API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch servers' },
      { status: 500 }
    );
  }
}