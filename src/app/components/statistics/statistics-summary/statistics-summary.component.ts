import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

import {
  EvaluationStatisticsResponse,
} from '../../../services/dtos/instructor-evaluation.dto';

@Component({
  selector: 'app-statistics-summary',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './statistics-summary.component.html',
  styleUrl: './statistics-summary.component.scss',
})
export class StatisticsSummaryComponent {

  @Input() statistics:
    EvaluationStatisticsResponse | null = null;

  @Input() loading = false;


  /* =========================
     TOTAL INSTRUCTORS
  ========================= */

  get totalInstructors(): number {
    return (
      this.statistics?.instructors?.length ??
      0
    );
  }


  /* =========================
     AVERAGE RATING
  ========================= */

  get averageRating(): number {
    return Number(
      this.statistics?.overall
        ?.averageRating ??
      0
    );
  }


  /* =========================
     TOTAL EVALUATIONS
  ========================= */

  get totalEvaluations(): number {
    return Number(
      this.statistics?.overall
        ?.totalEvaluations ??
      0
    );
  }


  /* =========================
     OBSERVATIONS
  ========================= */

  get evaluationsWithObservation(): number {
    return Number(
      this.statistics?.overall
        ?.observationsCount ??
      0
    );
  }


  /* =========================
     OBSERVATIONS %
  ========================= */

  get observationsPercentage(): number {
    if (!this.totalEvaluations) {
      return 0;
    }

    return Number(
      (
        (
          this.evaluationsWithObservation /
          this.totalEvaluations
        ) *
        100
      ).toFixed(1)
    );
  }


  /* =========================
     AVERAGE %
  ========================= */

  get averagePercentage(): number {
    return Math.min(
      100,
      Math.max(
        0,
        this.averageRating * 10
      )
    );
  }
}