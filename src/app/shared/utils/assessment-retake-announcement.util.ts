const RETAKE_MODAL_SEEN_PREFIX = 'platform_assessment_retake_modal_seen:';

export function retakeModalStorageKey(eventOrNotificationId: string): string {
  return `${RETAKE_MODAL_SEEN_PREFIX}${eventOrNotificationId}`;
}

export function hasSeenRetakeModal(eventOrNotificationId: string): boolean {
  return (
    localStorage.getItem(retakeModalStorageKey(eventOrNotificationId)) ===
    'true'
  );
}

export function markRetakeModalSeen(eventOrNotificationId: string): void {
  localStorage.setItem(retakeModalStorageKey(eventOrNotificationId), 'true');
}
