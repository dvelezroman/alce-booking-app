import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
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
export class ReportInstructorClassDetailComponent implements OnChanges {

  searchTerm = '';

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
     PAGINATION
  ========================= */

  page = 1;

  limit = 5;

  readonly limitOptions:
    number[] = [
      5,
      10,
      20,
      50,
    ];


  /* =========================
     CHANGES
  ========================= */

  ngOnChanges(
    changes: SimpleChanges,
  ): void {

    /*
     * Al cambiar la fecha o la lista
     * de instructores regresamos
     * automáticamente a la página 1.
     */
    if (
      changes['date'] ||
      changes['instructors']
    ) {
      this.page = 1;
    }
  }

  onSearchChange(
    value: string,
  ): void {
    this.searchTerm = value;
    this.page = 1;
  }


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

  get filteredInstructors(): InstructorGroupedData[] {
    const term =
      this.searchTerm
        .trim()
        .toLowerCase();

    if (!term) {
      return this.instructors;
    }

    return this.instructors.filter(
      instructor => {

        const fullName = [
          instructor.user.firstName,
          instructor.user.lastName,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const email =
          (
            instructor.user.emailAddress ||
            instructor.user.email ||
            ''
          )
            .toLowerCase();

        return (
          fullName.includes(term) ||
          email.includes(term)
        );
      },
    );
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

    const dateOnly =
      this.date.substring(0, 10);

    const [
      year,
      month,
      day,
    ] =
      dateOnly
        .split('-')
        .map(Number);

    if (
      !year ||
      !month ||
      !day
    ) {
      return this.date;
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
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      },
    );
  }


  /* =========================
     PAGINATED DATA
  ========================= */

  get paginatedInstructors():
    InstructorGroupedData[] {

    const start =
      (this.page - 1) *
      this.limit;

    return this.filteredInstructors.slice(
      start,
      start + this.limit,
    );
  }


  get totalPages(): number {
    if (!this.filteredInstructors.length) {
      return 1;
    }
    return Math.ceil(
      this.filteredInstructors.length /
      this.limit,
    );
  }


  get canPreviousPage(): boolean {
    return this.page > 1;
  }


  get canNextPage(): boolean {
    return (
      this.page <
      this.totalPages
    );
  }


  get startIndex(): number {
    if (!this.filteredInstructors.length) {
      return 0;
    }
    return (
      (this.page - 1) *
      this.limit
    ) + 1;
  }


  get endIndex(): number {
    return Math.min(
      this.page *
      this.limit,
      this.filteredInstructors.length,
    );
  }


  get paginationLabel(): string {
    if (!this.filteredInstructors.length) {
      return '0 instructores';
    }
    return (
      `Mostrando ${this.startIndex} a ${this.endIndex} ` +
      `de ${this.filteredInstructors.length} instructores`
    );
  }


  get visiblePages():
    (number | 'ellipsis')[] {

    if (
      this.totalPages <= 7
    ) {
      return Array.from(
        {
          length:
            this.totalPages,
        },
        (_, index) =>
          index + 1,
      );
    }

    if (
      this.page <= 4
    ) {
      return [
        1,
        2,
        3,
        4,
        5,
        'ellipsis',
        this.totalPages,
      ];
    }

    if (
      this.page >=
      this.totalPages - 3
    ) {
      return [
        1,
        'ellipsis',
        this.totalPages - 4,
        this.totalPages - 3,
        this.totalPages - 2,
        this.totalPages - 1,
        this.totalPages,
      ];
    }

    return [
      1,
      'ellipsis',
      this.page - 1,
      this.page,
      this.page + 1,
      'ellipsis',
      this.totalPages,
    ];
  }


  /* =========================
     PAGE ACTIONS
  ========================= */

  onPageChange(
    page: number,
  ): void {

    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.page
    ) {
      return;
    }

    this.page = page;
  }


  onPreviousPage(): void {
    if (
      !this.canPreviousPage
    ) {
      return;
    }

    this.page--;
  }


  onNextPage(): void {
    if (
      !this.canNextPage
    ) {
      return;
    }

    this.page++;
  }


  onLimitChange(
    value: number | string,
  ): void {

    const limit =
      Number(value);

    if (
      !Number.isFinite(limit) ||
      limit <= 0
    ) {
      return;
    }

    this.limit = limit;

    /*
     * Cada vez que cambia
     * 5 / 10 / 20 / 50,
     * regresamos a la primera página.
     */
    this.page = 1;
  }


  isPage(
    item:
      number |
      'ellipsis',
  ): item is number {

    return (
      typeof item === 'number'
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
      `${instructor.user.firstName}-${instructor.user.lastName}-${index}`
    );
  }
}