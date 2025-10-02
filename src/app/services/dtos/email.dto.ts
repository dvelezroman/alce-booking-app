// ------------------------------
// Request Models (envío de email)
// ------------------------------

export interface SendEmailRequest {
  to: string;
  subject: string;
  content: string;
  contentType: "html" | "text";
  fromName: string;
  replyTo?: string;
}

export interface BulkEmailRecipient {
  to: string;
  name: string;
}

export interface SendBulkEmailRequest {
  recipients: BulkEmailRecipient[];
  subject: string;
  content: string;
  contentType: "html" | "text";
  fromName: string;
  replyTo?: string;
  notificationGroupId?: number;
}

export interface SendTemplateEmailRequest {
  to: string;
  templateName: string;
  variables: Record<string, string>;
  fromName: string;
  replyTo?: string;
}

// ------------------------------
// Response Models (envío de email)
// ------------------------------

export interface EmailResponse {
  status: string;
  to: string;
  recipientName?: string;
  subject: string;
  sentAt?: string;
  scheduledFor?: string;
  error?: string;
}

export type BulkEmailResponse = EmailResponse[];

// ------------------------------
// Query Models (GET /messages)
// ------------------------------

export interface GetEmailMessagesQuery {
  page?: number;
  limit?: number;
  recipientType?: string;
  recipientEmail?: string;
  status?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  sentAtFrom?: string;
  sentAtTo?: string;
}

// ------------------------------
// Response Models (GET /messages)
// ------------------------------

export interface EmailMessage {
  id: number;
  messageId: string;
  recipientType: "INDIVIDUAL" | "GROUP" | string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  content: string;
  contentType: string;
  quantity: number;
  status: "SENT" | "FAILED" | "QUEUED" | string;
  sentAt?: string;
  deliveredAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetEmailMessagesResponse {
  status: string;
  totalMessages: number;
  page: number;
  limit: number;
  totalPages: number;
  messages: EmailMessage[];
}