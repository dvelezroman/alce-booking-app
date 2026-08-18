import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

import {
  EvaluationStatisticsResponse,
} from '../../../services/dtos/instructor-evaluation.dto';

type InstructorStatistic =
  EvaluationStatisticsResponse['instructors'][number];

interface RatingBarItem {
  name: string;
  initials: string;
  rating: number;
  percentage: number;
  evaluations: number;
  modifier:
    | 'excellent'
    | 'good'
    | 'regular'
    | 'low';
}

@Component({
  selector: 'app-statistics-rating-bar-chart',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './statistics-rating-bar-chart.component.html',
  styleUrl: './statistics-rating-bar-chart.component.scss',
})
export class StatisticsRatingBarChartComponent {

  @Input() statistics:
    EvaluationStatisticsResponse | null = null;

  @Input() loading = false;


  /* =========================
     DATA
  ========================= */

  get items(): RatingBarItem[] {
    if (!this.statistics?.instructors?.length) {
      return [];
    }

    return [...this.statistics.instructors]
      .sort(
        (a, b) =>
          Number(b.averageRating ?? 0) -
          Number(a.averageRating ?? 0),
      )
      .map((instructor) => {
        const rating =
          Number(
            instructor.averageRating ?? 0,
          );

        return {
          name:
            this.getInstructorName(
              instructor,
            ),

          initials:
            this.getInitials(
              instructor,
            ),

          rating,

          percentage:
            Math.min(
              100,
              Math.max(
                0,
                rating * 10,
              ),
            ),

          evaluations:
            this.getTotalEvaluations(
              instructor,
            ),

          modifier:
            this.getRatingModifier(
              rating,
            ),
        };
      });
  }


  /* =========================
     SUMMARY
  ========================= */

  get averageRating(): number {
    if (!this.items.length) {
      return 0;
    }

    const total =
      this.items.reduce(
        (sum, item) =>
          sum + item.rating,
        0,
      );

    return Number(
      (
        total /
        this.items.length
      ).toFixed(1),
    );
  }


  get bestRating(): number {
    if (!this.items.length) {
      return 0;
    }

    return Math.max(
      ...this.items.map(
        item => item.rating,
      ),
    );
  }


  /* =========================
     INSTRUCTOR
  ========================= */

  getInstructorName(
    instructor: InstructorStatistic,
  ): string {
    const value =
      instructor as InstructorStatistic & {
        instructorName?: string;
        firstName?: string;
        lastName?: string;
        instructor?: {
          user?: {
            firstName?: string;
            lastName?: string;
          };
        };
      };

    const firstName =
      value.instructor
        ?.user
        ?.firstName ||
      value.firstName ||
      '';

    const lastName =
      value.instructor
        ?.user
        ?.lastName ||
      value.lastName ||
      '';

    const fullName =
      [
        firstName,
        lastName,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

    return (
      fullName ||
      value.instructorName ||
      'Sin instructor'
    );
  }


  getInitials(
    instructor: InstructorStatistic,
  ): string {
    const name =
      this.getInstructorName(
        instructor,
      );

    const parts =
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (!parts.length) {
      return 'IN';
    }

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[
        parts.length - 1
      ][0]
    ).toUpperCase();
  }


  /* =========================
     EVALUATIONS
  ========================= */

  getTotalEvaluations(
    instructor: InstructorStatistic,
  ): number {
    const value =
      instructor as InstructorStatistic & {
        totalEvaluations?: number;
        evaluationsCount?: number;
        total?: number;
      };

    return Number(
      value.totalEvaluations ??
      value.evaluationsCount ??
      value.total ??
      0,
    );
  }


  /* =========================
     RATING
  ========================= */

  getRatingModifier(
    rating: number,
  ):
    | 'excellent'
    | 'good'
    | 'regular'
    | 'low' {

    if (rating >= 9) {
      return 'excellent';
    }

    if (rating >= 7) {
      return 'good';
    }

    if (rating >= 5) {
      return 'regular';
    }

    return 'low';
  }


  getRatingLabel(
    rating: number,
  ): string {
    if (rating >= 9) {
      return 'Excelente';
    }

    if (rating >= 7) {
      return 'Bueno';
    }

    if (rating >= 5) {
      return 'Regular';
    }

    return 'Bajo';
  }


  /* =========================
     TRACK
  ========================= */

  trackByName(
    index: number,
    item: RatingBarItem,
  ): string {
    return item.name;
  }
}