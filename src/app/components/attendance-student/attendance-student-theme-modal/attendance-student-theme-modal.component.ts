import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { MeetingThemeDto } from '../../../services/dtos/meeting-theme.dto';

type AttendanceMeetingTheme = MeetingThemeDto & {
  instructorName?: string;
};

@Component({
  selector: 'app-attendance-student-theme-modal',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './attendance-student-theme-modal.component.html',
  styleUrl: './attendance-student-theme-modal.component.scss',
})
export class AttendanceStudentThemeModalComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() meeting: AttendanceMeetingTheme | null = null;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() close =
    new EventEmitter<void>();


  /* =========================
     CLOSE
  ========================= */

  onClose(): void {
    this.close.emit();
  }


  /* =========================
     DATE
  ========================= */

  get meetingDate(): string {
    if (!this.meeting?.date) {
      return '—';
    }

    const date = new Date(this.meeting.date);

    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    ).format(date);
  }


  /* =========================
     HOUR
  ========================= */

  get meetingHour(): string {
    const hour = this.meeting?.hour;

    if (
      hour === undefined ||
      hour === null
    ) {
      return '—';
    }

    const numericHour = Number(hour);

    if (Number.isNaN(numericHour)) {
      return '—';
    }

    const period =
      numericHour >= 12
        ? 'PM'
        : 'AM';

    const normalizedHour =
      numericHour > 12
        ? numericHour - 12
        : numericHour === 0
          ? 12
          : numericHour;

    return `${normalizedHour}:00 ${period}`;
  }


  /* =========================
     STAGE
  ========================= */

  get stageLabel(): string {
    if (!this.meeting?.stageId) {
      return '—';
    }

    return `Stage ${this.meeting.stageId}`;
  }


  /* =========================
     INSTRUCTOR
  ========================= */

  get instructorLabel(): string {
    return (
      this.meeting?.instructorName ||
      'Sin instructor'
    );
  }


  /* =========================
     DESCRIPTION
  ========================= */

  get description(): string {
    return (
      this.meeting?.description ||
      'Sin descripción registrada.'
    );
  }
}