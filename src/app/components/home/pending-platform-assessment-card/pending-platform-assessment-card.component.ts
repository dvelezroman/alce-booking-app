import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  interval,
  Subscription,
} from 'rxjs';

import {
  PlatformAssessmentAssignment,
} from '../../../services/dtos/platform-assessment.dto';
import { computeAssessmentCountdown } from '../../../shared/utils/assessment-countdown.util';

export type PlatformAssessmentWithCountdown =
  PlatformAssessmentAssignment & {
    timeFormatted?: string;
    isUrgent?: boolean;
  };

@Component({
  selector: 'app-pending-platform-assessment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl:
    './pending-platform-assessment-card.component.html',
  styleUrl:
    './pending-platform-assessment-card.component.scss',
})
export class PendingPlatformAssessmentCardComponent
  implements OnInit, OnDestroy
{
  @Input()
  set assessments(
    value: PlatformAssessmentAssignment[]
  ) {
    this._assessments = (value ?? []).map(
      (assessment) => ({
        ...assessment,
      })
    );

    this.updateCountdowns();
  }

  @Output()
  openAssessment =
    new EventEmitter<PlatformAssessmentAssignment>();

  @Output()
  viewAll = new EventEmitter<void>();

  private _assessments:
    PlatformAssessmentWithCountdown[] = [];

  private intervalSub?: Subscription;

  get assessments():
    PlatformAssessmentWithCountdown[] {
    return this._assessments;
  }

  ngOnInit(): void {
    this.updateCountdowns();

    this.intervalSub = interval(1000)
      .subscribe(() => {
        this.updateCountdowns();
      });
  }

  ngOnDestroy(): void {
    this.intervalSub?.unsubscribe();
  }

  // ================================
  // ASSESSMENTS VISIBLES
  // ================================

  get visibleAssessments():
    PlatformAssessmentWithCountdown[] {
    return this._assessments.slice(0, 3);
  }

  get hasAssessments(): boolean {
    return this._assessments.length > 0;
  }

  // ================================
  // COUNTDOWN
  // ================================

  updateCountdowns(): void {
    const now = Date.now();

    this._assessments = this._assessments.map((assessment) => {
      const countdown = computeAssessmentCountdown(
        assessment.expiresAt,
        now,
      );
      return {
        ...assessment,
        timeFormatted: countdown.timeFormatted,
        isUrgent: countdown.isUrgent,
      };
    });
  }

  // ================================
  // ACCIONES
  // ================================

  onOpen(
    assessment:
      PlatformAssessmentAssignment
  ): void {
    this.openAssessment.emit(
      assessment
    );
  }

  onViewAll(): void {
    this.viewAll.emit();
  }

  // ================================
  // TRACK BY
  // ================================

  trackById(
    _index: number,
    assessment:
      PlatformAssessmentAssignment
  ): number {
    return assessment.id;
  }

  // ================================
  // STAGE
  // ================================

  stageLabel(
    assessment:
      PlatformAssessmentAssignment
  ): string {
    return assessment.studentStage != null
      ? `Stage ${assessment.studentStage}`
      : 'Stage —';
  }

  // ================================
  // FECHA COMPLETA
  // ================================

  expiresLabel(
    expiresAt: string | null
  ): string {
    if (!expiresAt) {
      return 'Sin fecha de vencimiento';
    }

    const date = new Date(expiresAt);

    if (
      Number.isNaN(date.getTime())
    ) {
      return 'Fecha por confirmar';
    }

    return date.toLocaleString(
      'es-ES',
      {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  }

  // ================================
  // MES DEL EXAMEN
  // ================================

  getAssessmentMonth(
    date:
      | string
      | Date
      | null
      | undefined
  ): string {
    if (!date) {
      return '—';
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
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

  // ================================
  // DÍA DEL EXAMEN
  // ================================

  getAssessmentDay(
    date:
      | string
      | Date
      | null
      | undefined
  ): string {
    if (!date) {
      return '—';
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
      }
    ).format(parsedDate);
  }

  // ================================
  // HORA DEL EXAMEN
  // ================================

  getAssessmentHour(
    date:
      | string
      | Date
      | null
      | undefined
  ): string {
    if (!date) {
      return '';
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
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
}