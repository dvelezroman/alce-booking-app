import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  InstructorEvaluation
} from '../../../services/dtos/instructor-evaluation.dto';

@Component({
  selector: 'app-completed-evaluation-card',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './completed-evaluation-card.component.html',
  styleUrl: './completed-evaluation-card.component.scss'
})
export class CompletedEvaluationCardComponent {

  @Input({ required: true })
  evaluation!: InstructorEvaluation;

  @Output()
  viewEvaluation =
    new EventEmitter<InstructorEvaluation>();

  get stageNumber(): string {
    const stageNumber =
      this.evaluation.meeting?.stage?.number ?? '';

    const numericStage =
      stageNumber.match(/\d+/)?.[0];

    return numericStage
      ? numericStage.padStart(2, '0')
      : '--';
  }

  get classTitle(): string {
    return (
      this.evaluation.meeting?.meetingTheme?.description ||
      'Clase evaluada'
    );
  }

  get stageDescription(): string {
    return (
      this.evaluation.meeting?.stage?.description ||
      'Etapa no disponible'
    );
  }

  get evaluationDate(): Date | null {
    const dateValue =
      this.evaluation.createdAt;

    if (!dateValue) {
      return null;
    }

    const date =
      new Date(dateValue);

    return Number.isNaN(date.getTime())
      ? null
      : date;
  }

  get formattedEvaluationDate(): string {
    if (!this.evaluationDate) {
      return 'Fecha no disponible';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    ).format(this.evaluationDate);
  }

  get rating(): number {
    return this.evaluation.rating ?? 0;
  }

  get formattedRating(): string {
    return Number.isInteger(this.rating)
      ? String(this.rating)
      : this.rating.toFixed(1);
  }

  get ratingLabel(): string {
    if (this.rating >= 9) {
      return 'Excelente';
    }

    if (this.rating >= 7) {
      return 'Muy buena';
    }

    if (this.rating >= 5) {
      return 'Buena';
    }

    return 'Registrada';
  }

  get cardModifierClass(): string {
    if (this.rating >= 9) {
      return 'completed-evaluation-card--excellent';
    }

    if (this.rating >= 7) {
      return 'completed-evaluation-card--good';
    }

    return 'completed-evaluation-card--default';
  }

  get hasObservation(): boolean {
    return Boolean(
      this.evaluation.observation?.trim()
    );
  }

  onViewEvaluation(): void {
    this.viewEvaluation.emit(
      this.evaluation
    );
  }
}