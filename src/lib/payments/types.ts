export type PaymentMethodType = 'credit_card' | 'paypal' | 'crypto' | 'bank_transfer' | 'balance';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed' | 'cancelled';
export type PaymentProviderType = 'stripe' | 'paypal' | 'coinbase' | 'manual' | 'balance';

export interface PaymentMetadata {
  orderId?: string;
  invoiceId?: string;
  userId?: string;
  description?: string;
  returnUrl?: string;
  cancelUrl?: string;
  [key: string]: unknown;
}

export interface CreatePaymentRequest {
  amount: number;
  currency: string;
  method: PaymentMethodType;
  provider: PaymentProviderType;
  metadata: PaymentMetadata;
  idempotencyKey: string;
}

export interface CreatePaymentResponse {
  paymentId: string;
  providerPaymentId: string;
  status: PaymentStatus;
  clientToken?: string;
  redirectUrl?: string;
  expiresAt?: Date;
  rawResponse?: unknown;
}

export interface VerifyPaymentRequest {
  providerPaymentId: string;
  paymentId: string;
}

export interface VerifyPaymentResponse {
  status: PaymentStatus;
  paidAt?: Date;
  rawResponse?: unknown;
}

export interface RefundPaymentRequest {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export interface RefundPaymentResponse {
  refundId: string;
  status: PaymentStatus;
  rawResponse?: unknown;
}

export interface WebhookPayload {
  provider: PaymentProviderType;
  eventType: string;
  providerEventId: string;
  rawPayload: unknown;
  headers: Record<string, string>;
  receivedAt: Date;
}

export interface ProcessedWebhookResult {
  paymentId: string;
  status: PaymentStatus;
  action: 'created' | 'updated' | 'refunded' | 'ignored';
  metadata?: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly name: PaymentProviderType;
  readonly supportedMethods: PaymentMethodType[];
  readonly supportsRefunds: boolean;
  readonly supportsWebhooks: boolean;

  createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse>;
  verifyPayment(request: VerifyPaymentRequest): Promise<VerifyPaymentResponse>;
  refundPayment?(request: RefundPaymentRequest): Promise<RefundPaymentResponse>;
  handleWebhook(payload: WebhookPayload): Promise<ProcessedWebhookResult>;
  constructWebhookEvent(rawBody: string | Buffer, signature: string): WebhookPayload;
}

export interface PaymentProviderConfig {
  apiKey: string;
  secretKey?: string;
  webhookSecret?: string;
  environment: 'sandbox' | 'production';
  [key: string]: unknown;
}

export interface OrderPaymentData {
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethodType;
  provider: PaymentProviderType;
  returnUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
}

export interface PaymentSession {
  sessionId: string;
  orderId: string;
  paymentId: string;
  providerPaymentId: string;
  status: PaymentStatus;
  clientToken?: string;
  redirectUrl?: string;
  expiresAt: Date;
  createdAt: Date;
}