import { Notification } from '../../services/dtos/notification.dto';

/**
 * Keep deeplink kinds aligned with API
 * `resolveNotificationPushUrl` in
 * alce-api/.../notification-listener.service.ts
 * when adding new operational kinds.
 */

export type InboxNotificationCategory =
  | 'action'
  | 'communication';

export type InstructorNotificationTarget = {
  path: string;
  queryParams?: Record<string, string>;
};

const OPERATIONAL_KINDS = new Set([
  'lead-scheduling-assigned',
  'lead-scheduling-cancelled',
  'demo-class',
  'demo_class',
  'placement-exam',
  'placement_exam',
  'induction',
  'assessment-assigned',
  'assessment-results-ready',
  'assessment-unassigned',
]);

function messageKind(
  notification: Notification,
): string {
  return (
    notification.message?.kind ?? ''
  ).toLowerCase();
}

function leadSchedulingRequestId(
  notification: Notification,
): number | null {
  const summary = notification.message?.summary as
    | { leadSchedulingRequestId?: number }
    | undefined;
  const summaryId = summary?.leadSchedulingRequestId;
  if (
    typeof summaryId === 'number' &&
    Number.isFinite(summaryId)
  ) {
    return summaryId;
  }

  const leadId =
    notification.message?.lead
      ?.leadSchedulingRequestId;
  if (
    typeof leadId === 'number' &&
    Number.isFinite(leadId)
  ) {
    return leadId;
  }

  return null;
}

/** Notifications that require instructor action / queue attention. */
export function isInstructorOperationalNotification(
  notification: Notification,
): boolean {
  const kind = messageKind(notification);
  if (OPERATIONAL_KINDS.has(kind)) {
    return true;
  }

  // Legacy placement-exam payloads without kind
  const title = (
    notification.title ?? ''
  ).toLowerCase();
  const body = (
    notification.message?.body ?? ''
  ).toLowerCase();
  if (
    /examen de ubicaci[oó]n|placement\s*exam|clase de cortes[ií]a|demo\s*class|speaking/.test(
      `${title} ${body}`,
    ) &&
    !!notification.message?.lead
  ) {
    return true;
  }

  return false;
}

export function inboxCategoryForNotification(
  notification: Notification,
): InboxNotificationCategory {
  return isInstructorOperationalNotification(
    notification,
  )
    ? 'action'
    : 'communication';
}

/**
 * Instructor deeplink for operational notifications.
 * Parity with API `resolveNotificationPushUrl`.
 * Returns null → fall back to notification detail.
 */
export function resolveInstructorNotificationTarget(
  notification: Notification,
): InstructorNotificationTarget | null {
  const kind =
    notification.message?.kind ?? '';
  const kindLower = kind.toLowerCase();

  if (kind === 'assessment-assigned') {
    const direct =
      notification.message?.directAccessUrl;
    if (
      typeof direct === 'string' &&
      direct.trim().length > 0
    ) {
      return { path: direct.trim() };
    }
    return null;
  }

  if (
    kind === 'assessment-results-ready'
  ) {
    const results =
      notification.message?.resultsUrl;
    if (
      typeof results === 'string' &&
      results.trim().length > 0
    ) {
      return { path: results.trim() };
    }
    return null;
  }

  if (
    kind === 'lead-scheduling-assigned' ||
    kind === 'lead-scheduling-cancelled'
  ) {
    const id =
      leadSchedulingRequestId(notification);
    if (id != null) {
      return {
        path: `/dashboard/instructor/lead-scheduling-requests/${id}`,
      };
    }
    return {
      path: '/dashboard/instructor/lead-scheduling-requests',
    };
  }

  if (
    kindLower === 'demo-class' ||
    kindLower === 'demo_class'
  ) {
    const id =
      leadSchedulingRequestId(notification);
    if (id != null) {
      return {
        path: `/dashboard/instructor/lead-scheduling-requests/${id}`,
      };
    }
    return {
      path: '/dashboard/instructor/lead-scheduling-requests',
      queryParams: {
        kind: 'DEMO_CLASS',
        queue: 'pending',
      },
    };
  }

  if (
    kindLower === 'placement-exam' ||
    kindLower === 'placement_exam'
  ) {
    const id =
      leadSchedulingRequestId(notification);
    if (id != null) {
      return {
        path: `/dashboard/instructor/lead-scheduling-requests/${id}`,
      };
    }
    return {
      path: '/dashboard/instructor/lead-scheduling-requests',
      queryParams: {
        kind: 'PLACEMENT_EXAM',
        queue: 'pending',
      },
    };
  }

  if (
    isInstructorOperationalNotification(
      notification,
    ) &&
    !!notification.message?.lead
  ) {
    const id =
      leadSchedulingRequestId(notification);
    if (id != null) {
      return {
        path: `/dashboard/instructor/lead-scheduling-requests/${id}`,
      };
    }
    return {
      path: '/dashboard/instructor/lead-scheduling-requests',
      queryParams: { queue: 'pending' },
    };
  }

  return null;
}
