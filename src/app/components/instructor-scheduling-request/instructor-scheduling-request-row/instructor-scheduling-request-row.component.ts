import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import {
  LeadSchedulingRequestRow,
  LeadSchedulingRequestStatus,
} from '../../../services/dtos/lead-scheduling-request.dto';

@Component({
  selector: 'app-instructor-scheduling-request-row',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './instructor-scheduling-request-row.component.html',
  styleUrl: './instructor-scheduling-request-row.component.scss',
})
export class InstructorSchedulingRequestRowComponent {
  @Input({ required: true }) item!: LeadSchedulingRequestRow;

  @Input() kindText!: (row: LeadSchedulingRequestRow) => string;

  @Input() statusText!: (
    status: LeadSchedulingRequestStatus,
  ) => string;

  @Input() slotText!: (
    row: LeadSchedulingRequestRow,
  ) => string;

  @Input() notesPreview!: (
    row: LeadSchedulingRequestRow,
  ) => string | null;

  get studentName(): string {
    const firstName = this.item.firstName?.trim() ?? '';
    const lastName = this.item.lastName?.trim() ?? '';

    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || 'Sin nombre';
  }

  get studentInitials(): string {
    const firstName = this.item.firstName?.trim()?.charAt(0) ?? '';
    const lastName = this.item.lastName?.trim()?.charAt(0) ?? '';

    const initials = `${firstName}${lastName}`.toUpperCase();

    return initials || 'ES';
  }

  get studentEmail(): string {
    return this.item.email || 'Sin correo';
  }

  get requestKindLabel(): string {
    if (!this.kindText) {
      return this.item.kind;
    }

    return this.kindText(this.item);
  }

  get requestKindClass(): 'demo' | 'placement' {
    return this.item.kind === 'PLACEMENT_EXAM'
      ? 'placement'
      : 'demo';
  }

  get requestStatusLabel(): string {
    if (!this.statusText) {
      return this.item.status;
    }

    return this.statusText(this.item.status);
  }

  get requestStatusClass():
    | 'pending'
    | 'scheduled'
    | 'completed'
    | 'cancelled' {
    switch (this.item.status) {
      case 'SCHEDULED':
        return 'scheduled';

      case 'COMPLETED':
        return 'completed';

      case 'CANCELLED':
        return 'cancelled';

      case 'PENDING':
      default:
        return 'pending';
    }
  }

  get requestNotes(): string | null {
    if (!this.notesPreview) {
      return this.item.requestNotes || null;
    }

    return this.notesPreview(this.item);
  }

  get hasNotes(): boolean {
    return !!this.requestNotes?.trim();
  }

  get formattedDate(): string {
    const rawDate = this.item.scheduledDate;

    if (!rawDate) {
      return 'Sin fecha';
    }

    const normalizedDate =
      rawDate.includes('T') || rawDate.endsWith('Z')
        ? rawDate
        : `${rawDate}T12:00:00`;

    const date = new Date(normalizedDate);

    if (Number.isNaN(date.getTime())) {
      return rawDate;
    }

    const today = new Date();

    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    const formatted = new Intl.DateTimeFormat('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
      .format(date)
      .replace('.', '');

    return isToday
      ? `Hoy, ${formatted}`
      : formatted;
  }

  get formattedHour(): string {
    const hour = this.item.scheduledHour;

    if (
      hour === null ||
      hour === undefined ||
      Number.isNaN(Number(hour))
    ) {
      return 'Sin hora';
    }

    const numericHour = Number(hour);

    const period = numericHour >= 12
      ? 'PM'
      : 'AM';

    const normalizedHour =
      numericHour % 12 === 0
        ? 12
        : numericHour % 12;

    return `${normalizedHour
      .toString()
      .padStart(2, '0')}:00 ${period}`;
  }

  get hasScheduledSession(): boolean {
    return !!(
      this.item.scheduledDate &&
      this.item.scheduledHour !== null &&
      this.item.scheduledHour !== undefined
    );
  }

  get isDemoClass(): boolean {
    return this.item.kind === 'DEMO_CLASS';
  }

  get isPlacementExam(): boolean {
    return this.item.kind === 'PLACEMENT_EXAM';
  }

  get isPending(): boolean {
    return this.item.status === 'PENDING';
  }

  get isScheduled(): boolean {
    return this.item.status === 'SCHEDULED';
  }

  get isCompleted(): boolean {
    return this.item.status === 'COMPLETED';
  }

  get isCancelled(): boolean {
    return this.item.status === 'CANCELLED';
  }
}