import {
  WhatsappJobOutcome,
  WhatsappJobResultItem,
  WhatsappJobStatusResponse,
} from '../../services/dtos/whatsapp-notificador.dto';

/** Resuelve `outcome` cuando el API no lo envía (compatibilidad). */
export function getJobOutcome(
  job: Pick<WhatsappJobStatusResponse, 'completed' | 'success' | 'status' | 'outcome'>,
): WhatsappJobOutcome {
  if (job.outcome) {
    return job.outcome;
  }
  if (!job.completed) {
    return 'pending';
  }
  if (job.status === 'COMPLETED' || job.success) {
    return 'success';
  }
  if (job.status === 'PARTIAL') {
    return 'partial';
  }
  return 'failed';
}

export function isJobPending(
  job: Pick<WhatsappJobStatusResponse, 'completed' | 'success' | 'status' | 'outcome'>,
): boolean {
  return getJobOutcome(job) === 'pending' || job.completed !== true;
}

export function isJobTerminalFailure(job: WhatsappJobStatusResponse): boolean {
  const outcome = getJobOutcome(job);
  return job.completed && (outcome === 'failed' || outcome === 'partial');
}

export function isJobTerminalSuccess(job: WhatsappJobStatusResponse): boolean {
  return job.completed && getJobOutcome(job) === 'success';
}

/** Proveedor puede devolver 201 u otro 2xx; no usar solo httpStatus === 200. */
export function isResultSent(row: Pick<WhatsappJobResultItem, 'status' | 'httpOk'>): boolean {
  return row.status === 'sent' || row.httpOk === true;
}

export function resolveResultStatus(
  row: WhatsappJobResultItem | undefined,
  job: WhatsappJobStatusResponse,
): WhatsappJobResultItem['status'] {
  if (row?.status) {
    return row.status;
  }
  return isJobTerminalSuccess(job) ? 'sent' : 'failed';
}
