import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  InstructorEvaluation,
} from '../../../services/dtos/instructor-evaluation.dto';

@Component({
  selector: 'app-meeting-evaluation-detail-panel',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './meeting-evaluation-detail-panel.component.html',
  styleUrl: './meeting-evaluation-detail-panel.component.scss',
})
export class MeetingEvaluationDetailPanelComponent {

  @Input() evaluation: InstructorEvaluation | null = null;

  @Output() closeRequested =
    new EventEmitter<void>();

  onClose(): void {
    this.closeRequested.emit();
  }

  getEvaluationId(): string {
    if (!this.evaluation?.id) {
      return '—';
    }

    return String(
      this.evaluation.id,
    );
  }

  getEvaluationDate(): string | Date | null {
    if (!this.evaluation) {
      return null;
    }

    const evaluation =
      this.evaluation as any;

    return (
      evaluation.meeting?.date ||
      evaluation.date ||
      evaluation.createdAt ||
      null
    );
  }

  getEvaluationHour(): string | number | null {
    if (!this.evaluation) {
      return null;
    }

    const evaluation =
      this.evaluation as any;

    return (
      evaluation.meeting?.localhour ??
      evaluation.meeting?.hour ??
      evaluation.localhour ??
      evaluation.hour ??
      null
    );
  }

  getStudentName(): string {
    if (!this.evaluation) {
      return 'Sin estudiante';
    }

    const evaluation =
      this.evaluation as any;

    const user =
      evaluation.student?.user ||
      evaluation.meeting?.student?.user ||
      evaluation.student ||
      null;

    if (!user) {
      return 'Sin estudiante';
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
      user.username ||
      'Sin estudiante'
    );
  }

  getStudentEmail(): string {
    if (!this.evaluation) {
      return '';
    }

    const evaluation =
      this.evaluation as any;

    const user =
      evaluation.student?.user ||
      evaluation.meeting?.student?.user ||
      evaluation.student ||
      null;

    return (
      user?.emailAddress ||
      user?.email ||
      user?.username ||
      ''
    );
  }

  getInstructorName(): string {
    if (!this.evaluation) {
      return 'Sin instructor';
    }

    const evaluation =
      this.evaluation as any;

    const user =
      evaluation.instructor?.user ||
      evaluation.meeting?.instructor?.user ||
      evaluation.instructor ||
      null;

    if (!user) {
      return 'Sin instructor';
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
      user.username ||
      'Sin instructor'
    );
  }

  getInstructorEmail(): string {
    if (!this.evaluation) {
      return '';
    }

    const evaluation =
      this.evaluation as any;

    const user =
      evaluation.instructor?.user ||
      evaluation.meeting?.instructor?.user ||
      evaluation.instructor ||
      null;

    return (
      user?.emailAddress ||
      user?.email ||
      user?.username ||
      ''
    );
  }

  getClassTitle(): string {
    if (!this.evaluation) {
      return 'Sin clase';
    }

    const evaluation =
      this.evaluation as any;

    const meeting =
      evaluation.meeting;

    const stage =
      meeting?.stage;

    const unit =
      meeting?.meetingTheme?.unit ??
      meeting?.unit;

    const stageLabel =
      stage?.stageNumber ??
      stage?.number ??
      meeting?.stageId;

    if (
      stageLabel &&
      unit
    ) {
      return `STG ${stageLabel} - Unit ${unit}`;
    }

    if (stageLabel) {
      return `STG ${stageLabel}`;
    }

    return (
      meeting?.title ||
      'Sin clase'
    );
  }

  getClassDescription(): string {
    if (!this.evaluation) {
      return '';
    }

    const evaluation =
      this.evaluation as any;

    return (
      evaluation.meeting?.meetingTheme?.description ||
      evaluation.meeting?.description ||
      ''
    );
  }

  getRating(): number | string {
    if (!this.evaluation) {
      return 0;
    }

    const evaluation =
      this.evaluation as any;

    return (
      evaluation.rating ??
      evaluation.score ??
      evaluation.points ??
      0
    );
  }

  getObservation(): string {
    if (!this.evaluation) {
      return 'Sin observación';
    }

    const evaluation =
      this.evaluation as any;

    return (
      evaluation.observation ||
      evaluation.comment ||
      evaluation.notes ||
      'Sin observación'
    );
  }

  getCreatedAt(): string | Date | null {
    if (!this.evaluation) {
      return null;
    }

    return (
      (this.evaluation as any).createdAt ||
      null
    );
  }

  getUpdatedAt(): string | Date | null {
    if (!this.evaluation) {
      return null;
    }

    return (
      (this.evaluation as any).updatedAt ||
      null
    );
  }

  formatDate(
    value: string | Date | null,
  ): string {
    if (!value) {
      return '—';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
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

  formatTime(
    value: string | Date | null,
  ): string {
    if (!value) {
      return '—';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
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

  formatMeetingHour(
    hour: string | number | null,
    dateValue?: string | Date | null,
  ): string {
    if (
      hour === null ||
      hour === undefined ||
      hour === ''
    ) {
      if (dateValue) {
        return this.formatTime(
          dateValue,
        );
      }

      return '—';
    }

    const numericHour =
      Number(hour);

    if (
      Number.isFinite(numericHour)
    ) {
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

      return `${String(normalizedHour).padStart(2, '0')}:00 ${period}`;
    }

    return String(hour);
  }
}