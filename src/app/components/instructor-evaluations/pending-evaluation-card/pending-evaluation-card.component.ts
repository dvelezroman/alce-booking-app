import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  PendingMeetingEvaluation
} from '../../../services/dtos/instructor-evaluation.dto';

@Component({
  selector: 'app-pending-evaluation-card',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './pending-evaluation-card.component.html',
  styleUrl: './pending-evaluation-card.component.scss'
})
export class PendingEvaluationCardComponent {

  @Input({ required: true })
  meeting!: PendingMeetingEvaluation;

  @Output()
  evaluate =
    new EventEmitter<PendingMeetingEvaluation>();

  get instructorName(): string {
    const firstName =
      this.meeting.instructor?.user?.firstName?.trim() ?? '';

    const lastName =
      this.meeting.instructor?.user?.lastName?.trim() ?? '';

    const fullName =
      `${firstName} ${lastName}`.trim();

    return fullName || 'Instructor';
  }

  get meetingDate(): Date | null {
    const dateValue =
      this.meeting.localdate ||
      this.meeting.date;

    if (!dateValue) {
      return null;
    }

    const date = new Date(dateValue);

    return Number.isNaN(date.getTime())
      ? null
      : date;
  }

  get formattedDate(): string {
    if (!this.meetingDate) {
      return 'Fecha no disponible';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    ).format(this.meetingDate);
  }

  get formattedTime(): string {
    const localHour =
      this.meeting.localhour ??
      this.meeting.hour;

    if (
      localHour !== null &&
      localHour !== undefined
    ) {
      return `${String(localHour).padStart(2, '0')}:00`;
    }

    if (!this.meetingDate) {
      return 'Hora no disponible';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }
    ).format(this.meetingDate);
  }

  get stageNumber(): string {
    const stageNumber =
      this.meeting.stage?.number ?? '';

    const numericStage =
      stageNumber.match(/\d+/)?.[0];

    return numericStage
      ? numericStage.padStart(2, '0')
      : '--';
  }

  get stageLabel(): string {
    return (
      this.meeting.stage?.number ||
      'Stage no disponible'
    );
  }

  get stageDescription(): string {
    return (
      this.meeting.stage?.description ||
      'Etapa no disponible'
    );
  }

  get classTitle(): string {
    return (
      this.meeting.meetingTheme?.description ||
      `Clase con ${this.instructorName}`
    );
  }

  get classMode(): string {
    const mode =
      this.meeting.mode?.toUpperCase();

    if (mode === 'ONLINE') {
      return 'Online';
    }

    if (
      mode === 'PRESENTIAL' ||
      mode === 'PRESENCIAL'
    ) {
      return 'Presencial';
    }

    return (
      this.meeting.mode ||
      'Modalidad no disponible'
    );
  }

  get modeIcon(): string {
    const mode =
      this.meeting.mode?.toUpperCase();

    if (mode === 'ONLINE') {
      return 'fa-solid fa-video';
    }

    return 'fa-solid fa-location-dot';
  }

  onEvaluate(): void {
    this.evaluate.emit(this.meeting);
  }
}