import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MeetingDTO,
} from '../../../services/dtos/booking.dto';

@Component({
  selector: 'app-searching-meeting-table',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './searching-meeting-table.component.html',
  styleUrl: './searching-meeting-table.component.scss',
})
export class SearchingMeetingTableComponent {

  @Input()
  meetings: MeetingDTO[] = [];

  @Input()
  selectedMeetingIds: any[] = [];

  @Input()
  getStudentDisplayName!: (
    meeting: MeetingDTO,
  ) => string;

  @Input()
  getInstructorDisplayName!: (
    meeting: MeetingDTO,
  ) => string;

  @Input()
  isNewUser!: (
    meeting: MeetingDTO,
  ) => boolean;

  @Output()
  selectionChange =
    new EventEmitter<number | undefined>();

  @Output()
  commentRequested =
    new EventEmitter<string>();

  @Output() selectAllChange = new EventEmitter<boolean>();

  isSelected(
    meetingId: number | undefined,
  ): boolean {
    return this.selectedMeetingIds.includes(
      meetingId,
    );
  }

  get allVisibleSelected(): boolean {
    if (this.meetings.length === 0) {
      return false;
    }

    return this.meetings.every(
      meeting =>
        meeting.id !== undefined &&
        this.selectedMeetingIds.includes(
          meeting.id,
        ),
    );
  }

  get someVisibleSelected(): boolean {
    if (
      this.meetings.length === 0 ||
      this.allVisibleSelected
    ) {
      return false;
    }

    return this.meetings.some(
      meeting =>
        meeting.id !== undefined &&
        this.selectedMeetingIds.includes(
          meeting.id,
        ),
    );
  }

  onToggleSelectAll(
    checked: boolean,
  ): void {
    this.selectAllChange.emit(
      checked,
    );
  }

  onToggleSelection(
    meetingId: number | undefined,
  ): void {
    this.selectionChange.emit(
      meetingId,
    );
  }

  onCommentRequested(
    comment: string | undefined,
  ): void {
    if (!comment) {
      return;
    }

    this.commentRequested.emit(
      comment,
    );
  }

  getStudentInitials(
    meeting: MeetingDTO,
  ): string {
    const firstName =
      meeting.student
        ?.user
        ?.firstName
        ?.trim() || '';

    const lastName =
      meeting.student
        ?.user
        ?.lastName
        ?.trim() || '';

    const initials =
      `${firstName.charAt(0)}${lastName.charAt(0)}`;

    return (
      initials ||
      'ES'
    ).toUpperCase();
  }

  getInstructorInitials(
    meeting: MeetingDTO,
  ): string {
    const firstName =
      meeting.instructor
        ?.user
        ?.firstName
        ?.trim() || '';

    const lastName =
      meeting.instructor
        ?.user
        ?.lastName
        ?.trim() || '';

    const initials =
      `${firstName.charAt(0)}${lastName.charAt(0)}`;

    return (
      initials ||
      'NA'
    ).toUpperCase();
  }

  getStudentEmail(
    meeting: MeetingDTO,
  ): string {
    return (
      meeting.student
        ?.user
        ?.email ||
      ''
    );
  }

  getAssignedByName(
    meeting: MeetingDTO,
  ): string {
    const firstName =
      meeting.assignedBy
        ?.firstName || '';

    const lastName =
      meeting.assignedBy
        ?.lastName || '';

    return (
      `${firstName} ${lastName}`.trim() ||
      '—'
    );
  }

  getStageLabel(
    meeting: MeetingDTO,
  ): string {
    return meeting.stage?.number
      ? `Stage ${meeting.stage.number}`
      : '—';
  }

  getCategoryLabel(
    meeting: MeetingDTO,
  ): string {
    const labels: Record<
      string,
      string
    > = {
      KIDS: 'Kids',
      TEENS: 'Teens',
      ADULTS: 'Adults',
    };

    return (
      labels[meeting.category] ||
      meeting.category ||
      '—'
    );
  }

  getModeLabel(
    meeting: MeetingDTO,
  ): string {
    const labels: Record<
      string,
      string
    > = {
      ONLINE: 'Online',
      PRESENCIAL: 'Presencial',
    };

    return (
      labels[meeting.mode] ||
      meeting.mode ||
      '—'
    );
  }

  getStatusLabel(
    meeting: MeetingDTO,
  ): string {
    const labels: Record<
      string,
      string
    > = {
      ACTIVE: 'Activa',
      INACTIVE: 'Inactiva',
      CANCELLED: 'Cancelada',
      DELETED: 'Eliminada',
    };

    return (
      labels[meeting.status] ||
      meeting.status ||
      '—'
    );
  }

  formatDate(
    value: Date | string,
  ): string {
    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return '—';
    }

    return date.toLocaleDateString(
      'es-EC',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    );
  }

  formatHour(
    hour: number,
  ): string {
    const period =
      hour >= 12
        ? 'PM'
        : 'AM';

    const normalizedHour =
      hour % 12 === 0
        ? 12
        : hour % 12;

    return `${normalizedHour
      .toString()
      .padStart(2, '0')}:00 ${period}`;
  }

  trackByMeetingId(
    index: number,
    meeting: MeetingDTO,
  ): number {
    return (
      meeting.id ??
      index
    );
  }
}