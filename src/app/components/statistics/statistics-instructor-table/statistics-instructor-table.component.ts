import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  EvaluationStatisticsResponse,
} from '../../../services/dtos/instructor-evaluation.dto';

type InstructorStatistic =
  EvaluationStatisticsResponse['instructors'][number];

@Component({
  selector: 'app-statistics-instructor-table',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './statistics-instructor-table.component.html',
  styleUrl: './statistics-instructor-table.component.scss',
})
export class StatisticsInstructorTableComponent {

  @Input() instructors: InstructorStatistic[] = [];
  @Input() loading = false;
  @Input() startIndex = 1;

  @Output() instructorSelected = new EventEmitter<InstructorStatistic>();

  onViewInstructor(
    instructor: InstructorStatistic,
  ): void {
    this.instructorSelected.emit(
      instructor,
    );
  }

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
      value.instructor?.user?.firstName ||
      value.firstName ||
      '';

    const lastName =
      value.instructor?.user?.lastName ||
      value.lastName ||
      '';

    const fullName =
      [firstName, lastName]
        .filter(Boolean)
        .join(' ')
        .trim();

    return (
      fullName ||
      value.instructorName ||
      'Sin instructor'
    );
  }

  getInstructorEmail(
    instructor: InstructorStatistic,
  ): string {
    const value =
      instructor as InstructorStatistic & {
        email?: string;
        emailAddress?: string;
        instructor?: {
          user?: {
            email?: string;
            emailAddress?: string;
          };
        };
      };

    return (
      value.instructor?.user?.emailAddress ||
      value.instructor?.user?.email ||
      value.emailAddress ||
      value.email ||
      ''
    );
  }

  getInitials(
    instructor: InstructorStatistic,
  ): string {
    const name =
      this.getInstructorName(instructor);

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
      parts[parts.length - 1][0]
    ).toUpperCase();
  }

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
      0
    );
  }

  getAverageRating(
    instructor: InstructorStatistic,
  ): number {
    return Number(
      instructor.averageRating ?? 0
    );
  }

  getObservationCount(
    instructor: InstructorStatistic,
  ): number {
    const value =
      instructor as InstructorStatistic & {
        evaluationsWithObservation?: number;
        observationsCount?: number;
        withObservations?: number;
      };

    return Number(
      value.evaluationsWithObservation ??
      value.observationsCount ??
      value.withObservations ??
      0
    );
  }

  getObservationPercentage(
    instructor: InstructorStatistic,
  ): number {
    const total =
      this.getTotalEvaluations(
        instructor,
      );

    if (!total) {
      return 0;
    }

    return Number(
      (
        this.getObservationCount(
          instructor,
        ) /
        total *
        100
      ).toFixed(1)
    );
  }

  getRatingClass(
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

  trackByInstructor(
    index: number,
    instructor: InstructorStatistic,
  ): number | string {
    const value =
      instructor as InstructorStatistic & {
        instructorId?: number;
        id?: number;
      };

    return (
      value.instructorId ??
      value.id ??
      index
    );
  }
}