import {
  Component,
  Input,
} from '@angular/core';

import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-stage-assessment-summary',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './stage-assessment-summary.component.html',
  styleUrl: './stage-assessment-summary.component.scss',
})
export class StageAssessmentSummaryComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  hasStageSelected = false;

  @Input()
  totalStudents = 0;

  @Input()
  averageProgress = 0;

  @Input()
  activeAssessmentsCount = 0;

  @Input()
  resourcesCount = 0;

  @Input()
  stageEntryDate: string | null = null;


  /* =========================
     PROGRESS
  ========================= */

  get normalizedProgress(): number {
    const value =
      Number(this.averageProgress) || 0;

    return Math.min(
      100,
      Math.max(
        0,
        Math.round(value),
      ),
    );
  }


  get progressLabel(): string {
    const progress =
      this.normalizedProgress;

    if (progress >= 80) {
      return 'Excelente progreso';
    }

    if (progress >= 60) {
      return 'Buena participación';
    }

    if (progress >= 40) {
      return 'Progreso moderado';
    }

    if (progress > 0) {
      return 'Progreso inicial';
    }

    return 'Sin progreso registrado';
  }


  /* =========================
     DATE
  ========================= */

  get formattedStageEntryDate(): string {
    if (!this.stageEntryDate) {
      return 'Sin fecha';
    }

    const date =
      new Date(this.stageEntryDate);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return this.stageEntryDate;
    }

    return new Intl.DateTimeFormat(
      'es-ES',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    )
      .format(date)
      .replace('.', '');
  }
}