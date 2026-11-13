const INVALID_EMAIL_BLOCK_REASON = 'invalid_email';
const INVALID_EMAIL_BLOCK_DETAIL_SEPARATOR = '::';

/**
 * Keep in sync with alce-api kids-scheduling-block.policy:
 * KIDS are NOT blocked for overdue assessments or pending class evaluations.
 * Email bans and other BLOCK reasons still apply.
 */

export function isInvalidEmailBlockReason(
  reason?: string | null
): boolean {
  if (!reason?.trim()) {
    return false;
  }
  const normalized = reason.trim().toLowerCase();
  return (
    normalized === INVALID_EMAIL_BLOCK_REASON ||
    normalized.startsWith(
      `${INVALID_EMAIL_BLOCK_REASON}${INVALID_EMAIL_BLOCK_DETAIL_SEPARATOR}`
    )
  );
}

function isKidsClassification(
  classification?: string | null
): boolean {
  return classification?.toString().trim().toUpperCase() === 'KIDS';
}

/** Assessment/evaluation reasons KIDS may ignore for booking. */
export function isKidsExemptSchedulingBlockReason(
  reason?: string | null
): boolean {
  return (
    reason === 'incomplete_assessment' ||
    reason === 'pending_evaluations' ||
    reason === 'both'
  );
}

export type SchedulingBlockAgendaUser = {
  status?: string | null;
  schedulingBlockReason?: string | null;
  student?: {
    studentClassification?: string | null;
  } | null;
};

/**
 * Whether booking UI should treat the student as blocked from scheduling.
 * Mirrors alce-api `shouldBlockUserForScheduling`.
 */
export function isStudentSchedulingBlockedForAgenda(
  user?: SchedulingBlockAgendaUser | null
): boolean {
  if (!user || user.status !== 'BLOCK') {
    return false;
  }

  if (isInvalidEmailBlockReason(user.schedulingBlockReason)) {
    return true;
  }

  if (
    isKidsClassification(user.student?.studentClassification) &&
    isKidsExemptSchedulingBlockReason(user.schedulingBlockReason)
  ) {
    return false;
  }

  return true;
}

export function getInvalidEmailBlockDetail(
  reason?: string | null
): string | null {
  if (!isInvalidEmailBlockReason(reason)) {
    return null;
  }
  const trimmed = reason!.trim();
  const prefix = `${INVALID_EMAIL_BLOCK_REASON}${INVALID_EMAIL_BLOCK_DETAIL_SEPARATOR}`;
  if (trimmed.toLowerCase().startsWith(prefix.toLowerCase())) {
    const detail = trimmed.slice(prefix.length).trim();
    return detail || null;
  }
  return null;
}

export function formatInvalidEmailSchedulingBlockMessage(
  reason?: string | null
): string {
  const base =
    'No puedes agendar porque tu correo está bloqueado (inválido o no recibe mensajes). Actualiza tu email en Perfil para reactivar el agendamiento.';
  const detail = getInvalidEmailBlockDetail(reason);
  if (!detail) {
    return base;
  }
  return `${base} Motivo: ${detail}`;
}

export function formatSchedulingBlockReasonForDisplay(
  reason?: string | null
): string {
  const raw = reason?.trim();
  if (!raw) {
    return '—';
  }

  if (isInvalidEmailBlockReason(raw)) {
    const detail = getInvalidEmailBlockDetail(raw);
    return detail
      ? `Correo bloqueado: ${detail}`
      : 'Correo bloqueado (inválido o no recibe mensajes)';
  }

  if (raw.toLowerCase().includes('banned_email')) {
    return 'Correo bloqueado (inválido o no recibe mensajes)';
  }

  if (raw.toLowerCase().includes('assessment')) {
    return 'Assessments expirados o incompletos';
  }

  if (
    raw.toLowerCase().includes('evaluacion') ||
    raw.toLowerCase().includes('evaluaciones') ||
    raw.toLowerCase().includes('evaluation')
  ) {
    return 'Evaluaciones pendientes';
  }

  if (raw === 'both') {
    return 'Assessments y evaluaciones pendientes';
  }

  return raw;
}

export function getBlockedSchedulingUserMessage(
  reason?: string | null
): string {
  const normalized = (reason || '').toLowerCase().trim();

  if (
    isInvalidEmailBlockReason(reason) ||
    normalized.includes('banned_email')
  ) {
    return formatInvalidEmailSchedulingBlockMessage(reason);
  }

  if (normalized.includes('assessment')) {
    return 'No puedes agendar clases porque ya EXPIRARON TUS ASSESSMENTS. Para su activación, comunícate con administración.';
  }

  if (
    normalized.includes('evaluacion') ||
    normalized.includes('evaluaciones') ||
    normalized.includes('evaluation')
  ) {
    return 'No puedes agendar clases porque tienes evaluaciones pendientes. Complétalas para poder agendar.';
  }

  return 'No puedes agendar clases porque ya EXPIRARON TUS ASSESSMENTS. Para su activación, comunícate con administración.';
}

export function getDashboardAgendaBlockMessage(
  reason?: string | null
): string {
  const normalized = (reason || '').toLowerCase().trim();

  if (
    isInvalidEmailBlockReason(reason) ||
    normalized.includes('banned_email')
  ) {
    const detail = getInvalidEmailBlockDetail(reason);
    const base =
      'Tu correo está bloqueado (inválido o no recibe mensajes). Actualiza tu email en Perfil para poder agendar clases.';
    return detail ? `${base} Motivo: ${detail}` : base;
  }

  if (normalized.includes('assessment')) {
    return 'Tienes assessments expirados. Debes completarlos para poder agendar nuevas clases.';
  }

  if (
    normalized.includes('evaluacion') ||
    normalized.includes('evaluaciones') ||
    normalized.includes('evaluation')
  ) {
    return 'Tienes clases pendientes por evaluar. Debes evaluarlas antes de poder agendar nuevas clases.';
  }

  if (reason?.trim()) {
    return reason.trim();
  }

  return 'No puedes agendar nuevas clases hasta completar tus evaluaciones o assessments pendientes.';
}
