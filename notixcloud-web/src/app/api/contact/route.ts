import { NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.enum(['general', 'sales', 'support', 'billing', 'abuse', 'press', 'other']),
  message: z.string().min(20).max(5000),
  honeypot: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Honeypot check
    if (body.honeypot) {
      return NextResponse.json({ success: true });
    }

    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid form data', errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = result.data;

    // In production, you would:
    // 1. Send email to support team
    // 2. Create support ticket in database
    // 3. Send confirmation email to user
    // 4. Log audit trail

    console.log('Contact form submission:', { name, email, subject, message });

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { message: 'Failed to process contact form' },
      { status: 500 }
    );
  }
}