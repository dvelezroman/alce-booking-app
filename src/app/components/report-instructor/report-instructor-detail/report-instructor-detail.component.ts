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
  selector: 'app-report-instructor-detail',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './report-instructor-detail.component.html',
  styleUrl: './report-instructor-detail.component.scss',
})
export class ReportInstructorDetailComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() instructor:
    InstructorGroupedData | null = null;

  @Input() selectedDate = '';


  /* =========================
     OUTPUTS
  ========================= */

  @Output() summaryRequested =
    new EventEmitter<InstructorGroupedData>();

  @Output() closeRequested =
    new EventEmitter<void>();


  /* =========================
     ACTIONS
  ========================= */

  onSummary(): void {
  console.log(
    'CLICK VER RESUMEN - instructor:',
    this.instructor
  );

  if (!this.instructor) {
    console.error(
      'NO HAY INSTRUCTOR EN ReportInstructorDetailComponent'
    );
    return;
  }

  console.log(
    'EMITIENDO summaryRequested:',
    this.instructor
  );

  this.summaryRequested.emit(
    this.instructor
  );
}

  onClose(): void {
    this.closeRequested.emit();
  }


  /* =========================
     USER
  ========================= */

  get fullName(): string {
    if (!this.instructor) {
      return 'Sin instructor seleccionado';
    }

    return [
      this.instructor.user.firstName,
      this.instructor.user.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim() ||
      'Sin nombre';
  }

  get initials(): string {
    if (!this.instructor) {
      return 'IN';
    }

    const first =
      this.instructor.user.firstName
        ?.trim()
        .charAt(0) || '';

    const last =
      this.instructor.user.lastName
        ?.trim()
        .charAt(0) || '';

    return (
      `${first}${last}`
        .toUpperCase() ||
      'IN'
    );
  }

  get email(): string {
    if (!this.instructor) {
      return 'Sin correo';
    }

    return (
      this.instructor.user.emailAddress ||
      this.instructor.user.email ||
      'Sin correo'
    );
  }


  /* =========================
     DATE
  ========================= */

  get formattedDate(): string {
    if (!this.selectedDate) {
      return 'Sin fecha';
    }

    const [
      year,
      month,
      day,
    ] = this.selectedDate
      .split('-')
      .map(Number);

    if (
      !year ||
      !month ||
      !day
    ) {
      return this.selectedDate;
    }

    const date =
      new Date(
        year,
        month - 1,
        day,
      );

    return date.toLocaleDateString(
      'es-EC',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    );
  }


  /* =========================
     HOURS
  ========================= */

  get totalHours(): number {
    return (
      this.instructor
        ?.user
        ?.hours
        ?.length ??
      0
    );
  }


  /* =========================
     STAGES
  ========================= */

  get totalStages(): number {
    if (
      !this.instructor
        ?.user
        ?.hours
    ) {
      return 0;
    }

    const stageIds =
      new Set<number>();

    this.instructor.user.hours
      .forEach(hour => {

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


  get stageLabels(): string[] {
    if (
      !this.instructor
        ?.user
        ?.hours
    ) {
      return [];
    }

    const stages =
      new Map<
        number | string,
        string
      >();

    this.instructor.user.hours
      .forEach(hour => {

        hour.stages
          ?.forEach(stage => {

            const key =
              stage.stageId ??
              stage.description;

            const label =
              stage.description ||
              (
                stage.stageId !== undefined
                  ? `Stage ${stage.stageId}`
                  : 'Sin Stage'
              );

            if (key !== undefined) {
              stages.set(
                key,
                label,
              );
            }

          });

      });

    return Array.from(
      stages.values(),
    );
  }


  /* =========================
     RANGE
  ========================= */

  get firstHour(): string {
    const hours =
      this.getSortedHours();

    if (!hours.length) {
      return '—';
    }

    return this.formatHour(
      hours[0].localhour,
    );
  }

  get lastHour(): string {
    const hours =
      this.getSortedHours();

    if (!hours.length) {
      return '—';
    }

    return this.formatHour(
      hours[
        hours.length - 1
      ].localhour,
    );
  }


  private getSortedHours(): any[] {
    if (
      !this.instructor
        ?.user
        ?.hours
    ) {
      return [];
    }

    return [
      ...this.instructor.user.hours,
    ].sort(
      (a, b) =>
        Number(
          a.localhour ?? 0,
        ) -
        Number(
          b.localhour ?? 0,
        ),
    );
  }


  private formatHour(
    hour: number | string,
  ): string {
    const value =
      Number(hour);

    if (
      !Number.isFinite(value)
    ) {
      return '—';
    }

    const period =
      value >= 12
        ? 'PM'
        : 'AM';

    const normalized =
      value === 0
        ? 12
        : value > 12
          ? value - 12
          : value;

    return `${normalized}:00 ${period}`;
  }


  /* =========================
     TRACK
  ========================= */

  trackByStage(
    index: number,
    stage: string,
  ): string {
    return stage;
  }
}