import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';

import { StageAssessment } from '../../../services/dtos/stage-assessment.dto';

export type StageAssessmentWithCountdown = StageAssessment & {
  timeFormatted?: string;
  isUrgent?: boolean;
};

@Component({
  selector: 'app-pending-assessment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-assessment-card.component.html',
  styleUrl: './pending-assessment-card.component.scss',
})
export class PendingAssessmentCardComponent
  implements OnInit, OnDestroy
{
  @Input() assessments: StageAssessmentWithCountdown[] = [];

  @Output() goToAssessment = new EventEmitter<number>();
  @Output() viewAll = new EventEmitter<void>();

  private intervalSub?: Subscription;

  ngOnInit(): void {
    this.updateCountdowns();

    this.intervalSub = interval(1000).subscribe(() => {
      this.updateCountdowns();
    });
  }

  ngOnDestroy(): void {
    this.intervalSub?.unsubscribe();
  }

  // ================================
  // Evaluaciones visibles
  // ================================
  get visibleAssessments(): StageAssessmentWithCountdown[] {
    return this.assessments.slice(0, 3);
  }

  get hasAssessments(): boolean {
    return this.assessments.length > 0;
  }

  // ================================
  // Actualizar cuenta regresiva
  // ================================
  updateCountdowns(): void {
    const now = Date.now();

    this.assessments = this.assessments.map((assessment) => {
      const target = this.getAssessmentTimestamp(
        assessment.dueDate
      );

      if (!target) {
        return {
          ...assessment,
          timeFormatted: '',
          isUrgent: false,
        };
      }

      const diff = target - now;

      if (diff <= 0) {
        return {
          ...assessment,
          timeFormatted: 'Tiempo finalizado',
          isUrgent: false,
        };
      }

      const days = Math.floor(diff / 86400000);
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

      formatted += `${this.pad(hours)}:${this.pad(
        minutes
      )}:${this.pad(seconds)}`;

      return {
        ...assessment,
        timeFormatted: formatted,
        isUrgent:
          diff <= 12 * 60 * 60 * 1000,
      };
    });
  }

  pad(value: number): string {
    return value < 10
      ? `0${value}`
      : value.toString();
  }

  // ================================
  // Acciones
  // ================================
  goToAssessmentPage(id: number): void {
    this.goToAssessment.emit(id);
  }

  goToAllAssessments(): void {
    this.viewAll.emit();
  }

  // ================================
  // Información visual
  // ================================
  getAssessmentTitle(
    assessment: StageAssessmentWithCountdown
  ): string {
    return (
      assessment.stageAssessmentResource
        ?.description || 'Evaluación pendiente'
    );
  }

  getAssessmentStage(
    assessment: StageAssessmentWithCountdown
  ): string {
    const stageDescription =
      assessment.stage?.description?.trim();

    if (stageDescription) {
      return stageDescription;
    }

    if (assessment.stage?.number !== undefined) {
      return `Stage ${assessment.stage.number}`;
    }

    return 'Nivel por confirmar';
  }

  getMonthAbbreviation(
    dueDate: string
  ): string {
    const date = this.parseLocalDate(dueDate);

    if (!date) {
      return '';
    }

    return date
      .toLocaleDateString('es-ES', {
        month: 'short',
      })
      .replace('.', '')
      .toUpperCase();
  }

  getDayNumber(dueDate: string): string {
    const date = this.parseLocalDate(dueDate);

    if (!date) {
      return '';
    }

    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
    });
  }

  getFormattedDueDate(
    dueDate: string
  ): string {
    const date = this.parseLocalDate(dueDate);

    if (!date) {
      return 'Fecha por confirmar';
    }

    const formattedDate =
      date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });

    return this.capitalize(formattedDate);
  }

  trackByAssessmentId(
    _index: number,
    assessment: StageAssessmentWithCountdown
  ): number {
    return assessment.id;
  }

  // ================================
  // Helpers privados
  // ================================
  private getAssessmentTimestamp(
    dueDate: string
  ): number | null {
    const date = this.parseLocalDate(dueDate);

    if (!date) {
      return null;
    }

    date.setHours(23, 59, 59, 999);

    return date.getTime();
  }

  private parseLocalDate(
    dateValue: string
  ): Date | null {
    if (!dateValue) {
      return null;
    }

    const datePart = dateValue.split('T')[0];
    const values = datePart
      .split('-')
      .map(Number);

    if (values.length !== 3) {
      return null;
    }

    const [year, month, day] = values;

    if (!year || !month || !day) {
      return null;
    }

    const date = new Date(
      year,
      month - 1,
      day
    );

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  }

  private capitalize(value: string): string {
    if (!value) {
      return value;
    }

    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );
  }
}