import { NextResponse } from 'next/server';
import { createVPSProvider } from '@/lib/providers';

const provider = createVPSProvider({
  type: 'mock',
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const server = await provider.getServer(id);

    if (!server) {
      return NextResponse.json(
        { error: 'Server not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ server });
  } catch (error) {
    console.error('Dashboard server detail API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch server' },
      { status: 500 }
    );
  }
}