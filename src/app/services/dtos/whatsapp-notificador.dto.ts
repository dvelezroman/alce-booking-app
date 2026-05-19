export type WhatsappJobStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'PARTIAL';

export interface ValidatePhonesRequest {
  phones: string[];
}

export interface PhoneValidationResult {
  phone: string;
  valid: boolean;
  normalizedDisplay?: string;
  reason?: string;
}

export interface ValidatePhonesResponse {
  allValid: boolean;
  results: PhoneValidationResult[];
}

export interface SendWhatsappRequest {
  batchId: string;
  phones: string[];
  contact: string;
  contentMessage: string;
}

export interface EnqueueWhatsappResponse {
  jobId: string;
  status: 'queued';
  batchId: string;
  totalCount: number;
  templateId: string;
  phones: string[];
}

export type WhatsappJobResultStatus = 'sent' | 'failed' | 'skipped';

export interface WhatsappJobResultItem {
  phone: string;
  status: WhatsappJobResultStatus;
  httpStatus?: number;
  notificadorId?: string | null;
  error?: string;
}

export interface WhatsappJobStatusResponse {
  jobId: string;
  batchId?: string;
  status: WhatsappJobStatus;
  completed: boolean;
  success: boolean;
  totalCount: number;
  sentCount: number;
  failedCount: number;
  contact: string;
  templateId: string;
  notificadorIds?: string[];
  results?: WhatsappJobResultItem[];
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface WhatsappGateStatusResponse {
  canSend: boolean;
  nextAvailableAt?: string | null;
  cooldownSeconds: number;
  batchId?: string;
  sentInBatch?: number;
  remainingInBatch?: number;
}
