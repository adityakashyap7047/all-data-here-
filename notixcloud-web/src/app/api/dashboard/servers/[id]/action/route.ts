import { NextResponse } from 'next/server';
import { createVPSProvider } from '@/lib/providers';

const provider = createVPSProvider({
  type: 'mock',
});

const validActions = ['start', 'stop', 'restart', 'reinstall', 'destroy'] as const;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, osTemplate } = body;

    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { message: 'Invalid action' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'start':
        result = await provider.startServer(id);
        break;
      case 'stop':
        result = await provider.stopServer(id, false);
        break;
      case 'restart':
        result = await provider.restartServer(id);
        break;
      case 'reinstall':
        if (!osTemplate) {
          return NextResponse.json(
            { message: 'OS template required for reinstall' },
            { status: 400 }
          );
        }
        result = await provider.reinstallServer(id, osTemplate);
        break;
      case 'destroy':
        result = await provider.destroyServer(id);
        break;
      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: result.message, data: result.data });
  } catch (error) {
    console.error('Dashboard server action API error:', error);
    return NextResponse.json(
      { message: 'Action failed' },
      { status: 500 }
    );
  }
}