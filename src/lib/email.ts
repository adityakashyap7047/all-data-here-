import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import { ReactElement } from 'react';
import { sanitizeHtml } from '@/lib/utils/security';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  if (!process.env.SMTP_HOST || process.env.NODE_ENV === 'development') {
    console.log('[DEV] Email would be sent:', { to, subject });
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });
    return { success: true };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error };
  }
}

export async function sendTemplatedEmail(
  to: string,
  subject: string,
  template: ReactElement
) {
  const html = await render(template);
  return sendEmail({ to, subject, html });
}

export const emailTemplates = {
  verifyEmail: (url: string, name: string) => ({
    subject: 'Verify your NOTIXCLOUD account',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0B0F19; border: 1px solid #1E293B; border-radius: 12px; padding: 32px;">
          <h1 style="color: #06B6D4; margin-bottom: 24px;">Verify your email</h1>
          <p style="color: #F8FAFC; margin-bottom: 16px;">Hi ${sanitizeHtml(name)},</p>
          <p style="color: #94A3B8; margin-bottom: 24px;">Thanks for signing up for NOTIXCLOUD. Please verify your email address to get started.</p>
          <a href="${sanitizeHtml(url)}" style="display: inline-block; background: #06B6D4; color: #0B0F19; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none;">Verify Email</a>
          <p style="color: #64748B; font-size: 14px; margin-top: 24px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  }),
  passwordReset: (url: string, name: string) => ({
    subject: 'Reset your NOTIXCLOUD password',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0B0F19; border: 1px solid #1E293B; border-radius: 12px; padding: 32px;">
          <h1 style="color: #06B6D4; margin-bottom: 24px;">Reset your password</h1>
          <p style="color: #F8FAFC; margin-bottom: 16px;">Hi ${sanitizeHtml(name)},</p>
          <p style="color: #94A3B8; margin-bottom: 24px;">You requested to reset your password. Click the button below to create a new password.</p>
          <a href="${sanitizeHtml(url)}" style="display: inline-block; background: #06B6D4; color: #0B0F19; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none;">Reset Password</a>
          <p style="color: #64748B; font-size: 14px; margin-top: 24px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  }),
  vpsCreated: (name: string, hostname: string, ip: string, credentials: { username: string; password: string }) => ({
    subject: `Your VPS ${hostname} is ready`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0B0F19; border: 1px solid #1E293B; border-radius: 12px; padding: 32px;">
          <h1 style="color: #10B981; margin-bottom: 24px;">VPS Ready</h1>
          <p style="color: #F8FAFC; margin-bottom: 16px;">Hi ${sanitizeHtml(name)},</p>
          <p style="color: #94A3B8; margin-bottom: 24px;">Your VPS <strong>${sanitizeHtml(hostname)}</strong> has been provisioned and is ready to use.</p>
          <div style="background: #161F30; border: 1px solid #1E293B; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #F8FAFC; margin: 0 0 8px;"><strong>IP Address:</strong> ${sanitizeHtml(ip)}</p>
            <p style="color: #F8FAFC; margin: 0 0 8px;"><strong>Username:</strong> ${sanitizeHtml(credentials.username)}</p>
            <p style="color: #F8FAFC; margin: 0;"><strong>Password:</strong> [Hidden for security - check dashboard]</p>
          </div>
          <p style="color: #64748B; font-size: 14px;">For security, your password is not sent via email. Please check the dashboard or use SSH key authentication.</p>
        </div>
      </div>
    `,
  }),
  invoiceCreated: (name: string, invoiceNumber: string, amount: string, dueDate: string, url: string) => ({
    subject: `Invoice ${invoiceNumber} - ${amount} due ${dueDate}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0B0F19; border: 1px solid #1E293B; border-radius: 12px; padding: 32px;">
          <h1 style="color: #06B6D4; margin-bottom: 24px;">New Invoice</h1>
          <p style="color: #F8FAFC; margin-bottom: 16px;">Hi ${sanitizeHtml(name)},</p>
          <p style="color: #94A3B8; margin-bottom: 24px;">A new invoice has been generated for your account.</p>
          <div style="background: #161F30; border: 1px solid #1E293B; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #F8FAFC; margin: 0 0 8px;"><strong>Invoice:</strong> ${sanitizeHtml(invoiceNumber)}</p>
            <p style="color: #F8FAFC; margin: 0 0 8px;"><strong>Amount:</strong> ${sanitizeHtml(amount)}</p>
            <p style="color: #F8FAFC; margin: 0;"><strong>Due Date:</strong> ${sanitizeHtml(dueDate)}</p>
          </div>
          <a href="${sanitizeHtml(url)}" style="display: inline-block; background: #06B6D4; color: #0B0F19; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none;">View Invoice</a>
        </div>
      </div>
    `,
  }),
  ticketCreated: (name: string, ticketNumber: string, subject: string, url: string) => ({
    subject: `Support Ticket Created: ${subject}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0B0F19; border: 1px solid #1E293B; border-radius: 12px; padding: 32px;">
          <h1 style="color: #06B6D4; margin-bottom: 24px;">Ticket Created</h1>
          <p style="color: #F8FAFC; margin-bottom: 16px;">Hi ${sanitizeHtml(name)},</p>
          <p style="color: #94A3B8; margin-bottom: 24px;">Your support ticket has been created successfully.</p>
          <div style="background: #161F30; border: 1px solid #1E293B; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #F8FAFC; margin: 0 0 8px;"><strong>Ticket:</strong> ${sanitizeHtml(ticketNumber)}</p>
            <p style="color: #F8FAFC; margin: 0;"><strong>Subject:</strong> ${sanitizeHtml(subject)}</p>
          </div>
          <a href="${sanitizeHtml(url)}" style="display: inline-block; background: #06B6D4; color: #0B0F19; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none;">View Ticket</a>
        </div>
      </div>
    `,
  }),
  ticketReply: (name: string, ticketNumber: string, subject: string, url: string) => ({
    subject: `Reply on Ticket ${ticketNumber}: ${subject}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #0B0F19; border: 1px solid #1E293B; border-radius: 12px; padding: 32px;">
          <h1 style="color: #06B6D4; margin-bottom: 24px;">New Reply</h1>
          <p style="color: #F8FAFC; margin-bottom: 16px;">Hi ${sanitizeHtml(name)},</p>
          <p style="color: #94A3B8; margin-bottom: 24px;">A staff member has replied to your ticket.</p>
          <div style="background: #161F30; border: 1px solid #1E293B; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #F8FAFC; margin: 0 0 8px;"><strong>Ticket:</strong> ${sanitizeHtml(ticketNumber)}</p>
            <p style="color: #F8FAFC; margin: 0;"><strong>Subject:</strong> ${sanitizeHtml(subject)}</p>
          </div>
          <a href="${sanitizeHtml(url)}" style="display: inline-block; background: #06B6D4; color: #0B0F19; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none;">View Reply</a>
        </div>
      </div>
    `,
  }),
};