import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { StageAssessment } from '../../../services/dtos/stage-assessment.dto';
import { AssessmentSectionType } from '../assessment-section/assessment-section.component';

@Component({
  selector: 'app-assessment-card',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './assessment-card.component.html',
  styleUrls: ['./assessment-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentCardComponent {

  @Input({ required: true }) assessment!: StageAssessment;
  @Input() sectionType: AssessmentSectionType = 'active';
  @Input() highlighted = false;

  @Output() openAssessment = new EventEmitter<StageAssessment>();
  @Output() viewAssessment = new EventEmitter<StageAssessment>();
  @Output() clearHighlight = new EventEmitter<void>();

  get isActive(): boolean {
    return this.sectionType === 'active';
  }

  get isExpired(): boolean {
    return this.sectionType === 'expired';
  }

  get isCompleted(): boolean {
    return this.sectionType === 'completed';
  }

  get assessmentTitle(): string {
    const resource =
      this.assessment.stageAssessmentResource;

    if (resource?.description?.trim()) {
      return resource.description.trim();
    }

    return `Assessment ${this.stageDisplayNumber}`;
  }

  get stageLabel(): string {
    return (
      this.assessment.stage?.number ||
      `STG ${this.stageDisplayNumber}`
    );
  }

  get stageDisplayNumber(): string {
    const stageNumber =
      this.assessment.stage?.number ?? '';

    const numericValue =
      stageNumber.match(/\d+/)?.[0] ??
      String(this.assessment.stageId ?? 0);

    return numericValue.padStart(2, '0');
  }

  get dueDateLabel(): string {
    if (!this.assessment.dueDate) {
      return 'Sin fecha límite';
    }

    return this.formatDate(
      this.assessment.dueDate,
    );
  }

  get completedDateLabel(): string {
    const assessmentWithCompletedDate =
      this.assessment as StageAssessment & {
        completedAt?: string | null;
        finishedAt?: string | null;
        updatedAt?: string | null;
      };

    const completedDate =
      assessmentWithCompletedDate.completedAt ??
      assessmentWithCompletedDate.finishedAt ??
      assessmentWithCompletedDate.updatedAt ??
      this.assessment.dueDate;

    if (!completedDate) {
      return 'Evaluación completada';
    }

    return `Completada el ${this.formatDate(completedDate)}`;
  }

  get remainingTimeLabel(): string {
    if (!this.assessment.dueDate) {
      return 'Sin fecha límite';
    }

    const dueDate = this.getStartOfDay(
      new Date(this.assessment.dueDate),
    );

    const today = this.getStartOfDay(
      new Date(),
    );

    const differenceInMilliseconds =
      dueDate.getTime() - today.getTime();

    const differenceInDays = Math.ceil(
      differenceInMilliseconds /
        (1000 * 60 * 60 * 24),
    );

    if (this.isExpired) {
      const expiredDays = Math.abs(
        differenceInDays,
      );

      if (expiredDays <= 1) {
        return 'Vencida hace 1 día';
      }

      return `Vencida hace ${expiredDays} días`;
    }

    if (differenceInDays <= 0) {
      return 'Vence hoy';
    }

    if (differenceInDays === 1) {
      return 'Vence mañana';
    }

    if (differenceInDays <= 3) {
      return `Vence pronto: ${differenceInDays} días`;
    }

    return `Tiempo restante: ${differenceInDays} días`;
  }

  get actionLabel(): string {
    if (this.isCompleted) {
      return 'Completada';
    }

    if (this.isExpired) {
      return 'No disponible';
    }

    return 'Abrir evaluación';
  }

  get actionIcon(): string {
    if (this.isCompleted) {
      return 'fa-regular fa-eye';
    }

    if (this.isExpired) {
      return 'fa-solid fa-lock';
    }

    return 'fa-solid fa-arrow-up-right-from-square';
  }

  get statusIcon(): string {
    if (this.isCompleted) {
      return 'fa-solid fa-check';
    }

    if (this.isExpired) {
      return 'fa-regular fa-clock';
    }

    return 'fa-solid fa-file-pen';
  }

  get canOpenAssessment(): boolean {
    return this.isActive;
  }

  get canViewAssessment(): boolean {
    return this.isCompleted;
  }

  onActionClick(): void {
    if (this.isActive) {
      this.openAssessment.emit(
        this.assessment,
      );

      return;
    }

    if (this.isCompleted) {
      this.viewAssessment.emit(
        this.assessment,
      );
    }
  }

  onMenuClick(): void {
    if (this.highlighted) {
      this.clearHighlight.emit();
    }
  }

  onAnimationEnd(): void {
    if (!this.highlighted) {
      return;
    }

    this.clearHighlight.emit();
  }

  private formatDate(
    value: string,
  ): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Fecha no disponible';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    )
      .format(date)
      .replace('.', '');
  }

  private getStartOfDay(
    date: Date,
  ): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
  }
}