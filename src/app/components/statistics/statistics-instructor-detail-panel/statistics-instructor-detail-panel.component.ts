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
  selector: 'app-statistics-instructor-detail-panel',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './statistics-instructor-detail-panel.component.html',
  styleUrl: './statistics-instructor-detail-panel.component.scss',
})
export class StatisticsInstructorDetailPanelComponent {

  @Input() instructor: InstructorStatistic | null = null;

  @Output() closeRequested =
    new EventEmitter<void>();

  onClose(): void {
    this.closeRequested.emit();
  }

  getInstructorName(): string {
    if (!this.instructor) {
      return 'Sin instructor';
    }

    const value =
      this.instructor as InstructorStatistic & {
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

    const name =
      [firstName, lastName]
        .filter(Boolean)
        .join(' ')
        .trim();

    return (
      name ||
      value.instructorName ||
      'Sin instructor'
    );
  }

  getInstructorEmail(): string {
    if (!this.instructor) {
      return '';
    }

    const value =
      this.instructor as InstructorStatistic & {
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

  getInitials(): string {
    const name =
      this.getInstructorName();

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

  getInstructorId(): string {
    if (!this.instructor) {
      return '—';
    }

    const value =
      this.instructor as InstructorStatistic & {
        instructorId?: number;
        id?: number;
        instructor?: {
          id?: number;
        };
      };

    return String(
      value.instructorId ??
      value.instructor?.id ??
      value.id ??
      '—'
    );
  }

  getTotalEvaluations(): number {
    if (!this.instructor) {
      return 0;
    }

    const value =
      this.instructor as InstructorStatistic & {
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

  getAverageRating(): number {
    return Number(
      this.instructor?.averageRating ??
      0
    );
  }

  getObservationCount(): number {
    if (!this.instructor) {
      return 0;
    }

    const value =
      this.instructor as InstructorStatistic & {
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

  getObservationPercentage(): number {
    const total =
      this.getTotalEvaluations();

    if (!total) {
      return 0;
    }

    return Number(
      (
        this.getObservationCount() /
        total *
        100
      ).toFixed(1)
    );
  }

  getWithoutObservationCount(): number {
    return Math.max(
      0,
      this.getTotalEvaluations() -
      this.getObservationCount()
    );
  }

  getWithoutObservationPercentage(): number {
    const total =
      this.getTotalEvaluations();

    if (!total) {
      return 0;
    }

    return Number(
      (
        this.getWithoutObservationCount() /
        total *
        100
      ).toFixed(1)
    );
  }

  getRatingLabel(): string {
    const rating =
      this.getAverageRating();

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

  getRatingModifier():
    | 'excellent'
    | 'good'
    | 'regular'
    | 'low' {

    const rating =
      this.getAverageRating();

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
}