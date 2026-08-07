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

export type WhatsappJobOutcome = 'pending' | 'success' | 'partial' | 'failed';

export interface EnqueueWhatsappResponse {
  jobId: string;
  status: WhatsappJobStatus;
  completed: boolean;
  success: boolean;
  outcome: WhatsappJobOutcome;
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
  /** true si el proveedor aceptó el envío (2xx o status sent) */
  httpOk?: boolean;
  notificadorId?: string | null;
  error?: string;
}

/** Fila de resultado en UI (envío secuencial multi-destinatario). */
export interface WhatsappSendDisplayResult extends WhatsappJobResultItem {
  recipientName?: string;
}

export interface WhatsappJobStatusResponse {
  jobId: string;
  batchId?: string;
  status: WhatsappJobStatus;
  completed: boolean;
  success: boolean;
  outcome: WhatsappJobOutcome;
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

export type WhatsappCampaignOverallStatus =
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'FAILED';

export interface WhatsappCampaignSummary {
  batchId: string;
  jobCount: number;
  totalRecipients: number;
  totalSent: number;
  totalFailed: number;
  sentInBatch: number;
  remainingInBatch: number;
  overallStatus: WhatsappCampaignOverallStatus;
  startedAt: string;
  lastActivityAt: string;
  createdByName?: string;
  messagePreview?: string;
}

export interface WhatsappCampaignListResponse {
  items: WhatsappCampaignSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface WhatsappCampaignJobSummary {
  jobId: string;
  status: WhatsappJobStatus;
  contact: string;
  totalCount: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  contentPreview?: string;
}

export interface WhatsappCampaignDetail extends WhatsappCampaignSummary {
  jobs: WhatsappCampaignJobSummary[];
}

export interface WhatsappGateStatusResponse {
  canSend: boolean;
  nextAvailableAt?: string | null;
  cooldownSeconds: number;
  batchId?: string;
  sentInBatch?: number;
  remainingInBatch?: number;
}
