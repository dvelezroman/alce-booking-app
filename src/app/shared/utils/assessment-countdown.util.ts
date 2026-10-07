export type AssessmentCountdownResult = {
  timeFormatted: string;
  isUrgent: boolean;
  isExpired: boolean;
};

const URGENT_MS = 12 * 60 * 60 * 1000;

function pad(value: number): string {
  return value < 10 ? `0${value}` : value.toString();
}

/**
 * Live countdown for assessment due/expires timestamps.
 * Matches home pending stage/platform assessment cards.
 */
export function computeAssessmentCountdown(
  iso: string | null | undefined,
  nowMs: number = Date.now(),
): AssessmentCountdownResult {
  if (iso == null || iso === '') {
    return {
      timeFormatted: '',
      isUrgent: false,
      isExpired: false,
    };
  }

  const target = new Date(iso).getTime();
  if (!Number.isFinite(target)) {
    return {
      timeFormatted: '',
      isUrgent: false,
      isExpired: false,
    };
  }

  const diff = target - nowMs;
  if (diff <= 0) {
    return {
      timeFormatted: 'Tiempo finalizado',
      isUrgent: false,
      isExpired: true,
    };
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const minutes = Math.floor((diff / 60000) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  let formatted = '';
  if (days > 0) {
    formatted += `${days}d `;
  }
  formatted += `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return {
    timeFormatted: formatted,
    isUrgent: diff <= URGENT_MS,
    isExpired: false,
  };
}
