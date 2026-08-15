import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';
import { RouterModule } from '@angular/router';

import {
  LeadSchedulingRequestRow,
  LeadSchedulingRequestStatus,
} from '../../../services/dtos/lead-scheduling-request.dto';

import {
  leadSchedulingKindLabel,
  leadSchedulingScheduleSummary,
  requestNotesPreview,
} from '../../../shared/utils/lead-scheduling-request.util';

@Component({
  selector: 'app-admin-lead-scheduling-table',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './admin-lead-scheduling-table.component.html',
  styleUrl: './admin-lead-scheduling-table.component.scss',
})
export class AdminLeadSchedulingTableComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  items: LeadSchedulingRequestRow[] = [];

  @Input()
  loading = false;


  /* =========================
     STATES
  ========================= */

  readonly statusLabel: Record<LeadSchedulingRequestStatus, string> = {
    PENDING: 'Pendiente',
    SCHEDULED: 'Agendada',
    CANCELLED: 'Cancelada',
    COMPLETED: 'Completada',
  };


  /* =========================
     TRACK
  ========================= */

  trackByRequest(
    index: number,
    item: LeadSchedulingRequestRow,
  ): number {
    return item.id;
  }


  /* =========================
     DATE CREATED
  ========================= */

  getCreatedDate(
    row: LeadSchedulingRequestRow,
  ): string {
    if (!row.createdAt) {
      return '—';
    }

    const date = new Date(row.createdAt);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
    ).format(date);
  }


  getCreatedTime(
    row: LeadSchedulingRequestRow,
  ): string {
    if (!row.createdAt) {
      return '—';
    }

    const date = new Date(row.createdAt);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
    ).format(date);
  }


  /* =========================
     KIND
  ========================= */

  getKindLabel(
    row: LeadSchedulingRequestRow,
  ): string {
    return leadSchedulingKindLabel(row);
  }


  getKindClass(
    row: LeadSchedulingRequestRow,
  ): string {
    return row.kind === 'DEMO_CLASS'
      ? 'lead-scheduling-table__kind--demo'
      : 'lead-scheduling-table__kind--exam';
  }


  /* =========================
     APPLICANT
  ========================= */

  getApplicantName(
    row: LeadSchedulingRequestRow,
  ): string {
    return [
      row.firstName,
      row.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim() || '—';
  }


  getApplicantId(
    row: LeadSchedulingRequestRow,
  ): string {
    return row.idNumber || `ID: ${row.id}`;
  }


  /* =========================
     CONTACT
  ========================= */

  getEmail(
    row: LeadSchedulingRequestRow,
  ): string {
    return row.email || '—';
  }


  getPhone(
    row: LeadSchedulingRequestRow,
  ): string {
    return row.contactPhone || '—';
  }


  /* =========================
     SCHEDULE
  ========================= */

  getScheduledDate(
    row: LeadSchedulingRequestRow,
  ): string {
    if (!row.scheduledDate) {
      return '—';
    }

    const date = new Date(
      `${row.scheduledDate.slice(0, 10)}T12:00:00`,
    );

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
    ).format(date);
  }


  getScheduledHour(
    row: LeadSchedulingRequestRow,
  ): string {
    const hour = row.scheduledHour;

    if (
      hour === null ||
      hour === undefined
    ) {
      return '';
    }

    const numericHour = Number(hour);

    const period =
      numericHour >= 12
        ? 'p. m.'
        : 'a. m.';

    const normalizedHour =
      numericHour > 12
        ? numericHour - 12
        : numericHour === 0
          ? 12
          : numericHour;

    return `${normalizedHour
      .toString()
      .padStart(2, '0')}:00 ${period}`;
  }


  getScheduleSummary(
    row: LeadSchedulingRequestRow,
  ): string {
    return leadSchedulingScheduleSummary(row);
  }


  /* =========================
     INSTRUCTOR
  ========================= */

  getInstructorName(
    row: LeadSchedulingRequestRow,
  ): string {
    const user =
      row.instructor?.user;

    if (!user) {
      return '—';
    }

    const name = [
      user.firstName,
      user.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    return (
      name ||
      user.email ||
      '—'
    );
  }


  getInstructorId(
    row: LeadSchedulingRequestRow,
  ): string {
    return row.instructor?.id
      ? `ID: ${row.instructor.id}`
      : '';
  }


  /* =========================
     STATUS
  ========================= */

  getStatusLabel(
    status: LeadSchedulingRequestStatus,
  ): string {
    return this.statusLabel[status] ?? status;
  }


  getStatusClass(
    status: LeadSchedulingRequestStatus,
  ): string {
    switch (status) {
      case 'PENDING':
        return 'lead-scheduling-table__status--pending';

      case 'SCHEDULED':
        return 'lead-scheduling-table__status--scheduled';

      case 'CANCELLED':
        return 'lead-scheduling-table__status--cancelled';

      case 'COMPLETED':
        return 'lead-scheduling-table__status--completed';

      default:
        return '';
    }
  }


  /* =========================
     NOTES
  ========================= */

  getNotes(
    row: LeadSchedulingRequestRow,
  ): string {
    return (
      requestNotesPreview(
        row.requestNotes,
      ) ||
      row.adminNotes ||
      '—'
    );
  }
}