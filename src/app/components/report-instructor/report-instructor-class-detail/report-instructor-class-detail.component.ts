import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  InstructorGroupedData,
} from '../../../services/dtos/instructor-attendance-grouped.dto';

@Component({
  selector: 'app-report-instructor-class-detail',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './report-instructor-class-detail.component.html',
  styleUrl: './report-instructor-class-detail.component.scss',
})
export class ReportInstructorClassDetailComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() date = '';

  @Input() instructors:
    InstructorGroupedData[] = [];

  @Input() searchAttempted = false;

  @Input() hasPreviousDate = false;

  @Input() hasNextDate = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() previousDateRequested =
    new EventEmitter<void>();

  @Output() nextDateRequested =
    new EventEmitter<void>();

  @Output() instructorSelected =
    new EventEmitter<InstructorGroupedData>();


  /* =========================
     NAVIGATION
  ========================= */

  onPreviousDate(): void {
    if (!this.hasPreviousDate) {
      return;
    }

    this.previousDateRequested.emit();
  }

  onNextDate(): void {
    if (!this.hasNextDate) {
      return;
    }

    this.nextDateRequested.emit();
  }


  /* =========================
     INSTRUCTOR
  ========================= */

  onSelectInstructor(
    instructor: InstructorGroupedData,
  ): void {
    this.instructorSelected.emit(
      instructor,
    );
  }


  /* =========================
     DATE
  ========================= */

  get formattedDate(): string {
    if (!this.date) {
      return 'Sin fecha seleccionada';
    }

    const date =
      new Date(
        `${this.date}T00:00:00`,
      );

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return this.date;
    }

    return date.toLocaleDateString(
      'es-EC',
      {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      },
    );
  }


  /* =========================
     HOURS
  ========================= */

  getTotalHours(
    instructor: InstructorGroupedData,
  ): number {
    return (
      instructor.user.hours?.length ??
      0
    );
  }


  /* =========================
     STAGES
  ========================= */

  getUniqueStagesCount(
    instructor: InstructorGroupedData,
  ): number {
    const stageIds =
      new Set<number>();

    instructor.user.hours
      ?.forEach(hour => {

        hour.stages
          ?.forEach(stage => {

            if (
              stage.stageId !==
              undefined
            ) {
              stageIds.add(
                stage.stageId,
              );
            }

          });

      });

    return stageIds.size;
  }


  /* =========================
     INITIALS
  ========================= */

  getInitials(
    instructor: InstructorGroupedData,
  ): string {
    const first =
      instructor.user
        .firstName
        ?.trim()
        .charAt(0) || '';

    const last =
      instructor.user
        .lastName
        ?.trim()
        .charAt(0) || '';

    return (
      `${first}${last}`
        .toUpperCase() ||
      'IN'
    );
  }


  /* =========================
     FULL NAME
  ========================= */

  getFullName(
    instructor: InstructorGroupedData,
  ): string {
    return [
      instructor.user.firstName,
      instructor.user.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim() ||
      'Sin nombre';
  }


  /* =========================
     EMAIL
  ========================= */

  getEmail(
    instructor: InstructorGroupedData,
  ): string {
    return (
      instructor.user.emailAddress ||
      instructor.user.email ||
      'Sin correo'
    );
  }


  /* =========================
     TRACK
  ========================= */

  trackByInstructor(
    index: number,
    instructor: InstructorGroupedData,
  ): number | string {
    return (
      instructor.user.id ??
      index
    );
  }
}