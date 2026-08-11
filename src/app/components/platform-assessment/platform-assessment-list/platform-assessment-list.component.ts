import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformAssessmentAssignment } from '../../../services/dtos/platform-assessment.dto';
import { PlatformAssessmentCardComponent } from '../platform-assessment-card/platform-assessment-card.component';

export type PlatformAssessmentTab =
  | 'pending'
  | 'expired'
  | 'completed';

@Component({
  selector: 'app-platform-assessment-list',
  standalone: true,
  imports: [
    CommonModule,
    PlatformAssessmentCardComponent,
  ],
  templateUrl: './platform-assessment-list.component.html',
  styleUrl: './platform-assessment-list.component.scss',
})

export class PlatformAssessmentListComponent {

  @Input() assessments: PlatformAssessmentAssignment[] = [];
  @Input() selectedTab: PlatformAssessmentTab = 'pending';

  trackById( _index: number, assessment: PlatformAssessmentAssignment ): number {
    return assessment.id;
  }

  get isPendingTab(): boolean {
    return this.selectedTab === 'pending';
  }

  get isExpiredTab(): boolean {
    return this.selectedTab === 'expired';
  }

  get isCompletedTab(): boolean {
    return this.selectedTab === 'completed';
  }

  getStatusLabel(
    assessment:
      PlatformAssessmentAssignment
  ): string {
    const status = String(
      assessment.status ?? ''
    )
      .trim()
      .toLowerCase();

    const labels: Record<string, string> = {
      pending: 'Pendiente',
      expired: 'Vencida',
      completed: 'Completada',
    };

    return (
      labels[status] ??
      this.formatEnumValue(status)
    );
  }

  getStageLabel(
    assessment:
      PlatformAssessmentAssignment
  ): string {
    return assessment.studentStage != null
      ? `Stage ${assessment.studentStage}`
      : 'Stage —';
  }

  getAssessmentMonth(
    date:
      | string
      | Date
      | null
      | undefined
  ): string {
    const parsedDate =
      this.parseDate(date);

    if (!parsedDate) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        month: 'short',
      }
    )
      .format(parsedDate)
      .replace('.', '')
      .toUpperCase();
  }

  getAssessmentDay(
    date:
      | string
      | Date
      | null
      | undefined
  ): string {
    const parsedDate =
      this.parseDate(date);

    if (!parsedDate) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
      }
    ).format(parsedDate);
  }

  getAssessmentHour(
    date:
      | string
      | Date
      | null
      | undefined
  ): string {
    const parsedDate =
      this.parseDate(date);

    if (!parsedDate) {
      return '';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }
    ).format(parsedDate);
  }

  getAssessmentDateLabel(
    date:
      | string
      | Date
      | null
      | undefined
  ): string {
    const parsedDate =
      this.parseDate(date);

    if (!parsedDate) {
      return 'Fecha por confirmar';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }
    )
      .format(parsedDate)
      .replace(',', '');
  }

  getTimeRemaining(
    assessment:
      PlatformAssessmentAssignment
  ): string {
    if (!assessment.expiresAt) {
      return '';
    }

    const target =
      new Date(
        assessment.expiresAt
      ).getTime();

    if (Number.isNaN(target)) {
      return '';
    }

    const diff =
      target - Date.now();

    if (diff <= 0) {
      return 'Tiempo finalizado';
    }

    const days = Math.floor(
      diff / 86400000
    );

    const hours = Math.floor(
      (diff / 3600000) % 24
    );

    const minutes = Math.floor(
      (diff / 60000) % 60
    );

    const seconds = Math.floor(
      (diff / 1000) % 60
    );

    let formatted = '';

    if (days > 0) {
      formatted += `${days}d `;
    }

    formatted +=
      `${this.pad(hours)}:` +
      `${this.pad(minutes)}:` +
      `${this.pad(seconds)}`;

    return formatted;
  }

  isUrgent(
    assessment:
      PlatformAssessmentAssignment
  ): boolean {
    if (!assessment.expiresAt) {
      return false;
    }

    const target =
      new Date(
        assessment.expiresAt
      ).getTime();

    if (Number.isNaN(target)) {
      return false;
    }

    const diff =
      target - Date.now();

    return (
      diff > 0 &&
      diff <=
        12 * 60 * 60 * 1000
    );
  }

  private parseDate(
    date:
      | string
      | Date
      | null
      | undefined
  ): Date | null {
    if (!date) {
      return null;
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return null;
    }

    return parsedDate;
  }

  private pad(
    value: number
  ): string {
    return value < 10
      ? `0${value}`
      : value.toString();
  }

  private formatEnumValue(
    value: string
  ): string {
    if (!value) {
      return 'Sin estado';
    }

    return value
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(
        /^\w/,
        (letter) =>
          letter.toUpperCase()
      );
  }
}