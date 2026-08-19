import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';

import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';

import { AssessmentReportsHeaderComponent } from '../../../components/assessment-reports-v2/assessment-reports-header/assessment-reports-header.component';
import { AssessmentReportsFiltersComponent } from '../../../components/assessment-reports-v2/assessment-reports-filters/assessment-reports-filters.component';
import { AssessmentReportsStudentSummaryComponent } from '../../../components/assessment-reports-v2/assessment-reports-student-summary/assessment-reports-student-summary.component';
import { AssessmentReportsSummaryCardsComponent } from '../../../components/assessment-reports-v2/assessment-reports-summary-cards/assessment-reports-summary-cards.component';

import { AssessmentReportsInstructorTableComponent } from '../../../components/assessment-reports-v2/assessment-reports-instructor-table/assessment-reports-instructor-table.component';
import { AssessmentReportsInstructorPaginationComponent } from '../../../components/assessment-reports-v2/assessment-reports-instructor-pagination/assessment-reports-instructor-pagination.component';
import { AssessmentReportsPlatformTableComponent } from '../../../components/assessment-reports-v2/assessment-reports-platform-table/assessment-reports-platform-table.component';
import { AssessmentReportsInfoComponent } from '../../../components/assessment-reports-v2/assessment-reports-info/assessment-reports-info.component';

import {
  AssessementI,
  AssessmentType,
  FilterAssessmentI,
} from '../../../services/dtos/assessment.dto';
import { PlatformAssessmentAssignment } from '../../../services/dtos/platform-assessment.dto';
import { Stage } from '../../../services/dtos/student.dto';
import { UserDto, UserRole } from '../../../services/dtos/user.dto';

import { AssessmentService } from '../../../services/assessment.service';
import { PlatformAssessmentService } from '../../../services/platform-assessment.service';
import { StudyContentService } from '../../../services/study-content.service';
import { StagesService } from '../../../services/stages.service';
import { AssessmentPointsConfigService } from '../../../services/assessment-points-config.service';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-assessment-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    AssessmentReportsHeaderComponent,
    AssessmentReportsFiltersComponent,
    AssessmentReportsStudentSummaryComponent,
    AssessmentReportsSummaryCardsComponent,
    AssessmentReportsInstructorTableComponent,
    AssessmentReportsInstructorPaginationComponent,
    AssessmentReportsPlatformTableComponent,
    AssessmentReportsInfoComponent,
  ],
  templateUrl: './assessment-reports.component.html',
  styleUrl: './assessment-reports.component.scss',
})
export class AssessmentReportsComponent {
  modal: ModalDto = modalInitializer();
  instructorId: number | null = null;
  assessments: AssessementI[] = [];
  platformAssessments: PlatformAssessmentAssignment[] = [];
  maxPointsAssessment: number | null = null;
  minPointsAssessment: number | null = null;
  isStudentSelected = false;
  stageDescription = '';
  selectedStageId: number | null = null;
  selectedStudentId: number | null = null;
  highlightStageId: number | null = null;
  stagesWithContent: Stage[] = [];
  editingAssessment: AssessementI | null = null;
  editPoints: number | null = null;
  applyingPlatformId: number | null = null;
  applyPointsOverride: number | null = null;

  filteredStudents: UserDto[] = [];
  selectedStudent: UserDto | null = null;
  studentSearchInput$ = new Subject<string>();
  showStudentDropdown = false;
  isStudentFieldInvalid = false;

  page = 1;
  limit = 10;
  readonly limitOptions = [5, 10, 20, 50];

  constructor(
    private assessmentService: AssessmentService,
    private platformAssessmentService: PlatformAssessmentService,
    private studyContentService: StudyContentService,
    private stagesService: StagesService,
    private assessmentPointsConfigService: AssessmentPointsConfigService,
    private usersService: UsersService,
  ) {
    this.studentSearchInput$
      .pipe(debounceTime(300))
      .subscribe((term: string) => {
        this.fetchFilteredStudents(term);
      });
  }

  ngOnInit(): void {
    this.loadAssessmentConfig();
    this.loadStagesWithContent();
  }

  loadAssessmentConfig(): void {
    this.assessmentPointsConfigService.getById().subscribe({
      next: (config) => {
        this.maxPointsAssessment = config.maxPointsAssessment;
        this.minPointsAssessment = config.minPointsAssessment;
      },
      error: () => {
        this.showModal(
          this.createModalParams(
            true,
            'Error al cargar configuración.',
          ),
        );
      },
    });
  }

  loadStagesWithContent(): void {
    this.stagesService.getAll().subscribe((allStages) => {
      const stagesWithContent: Stage[] = [];
      let processedCount = 0;

      allStages.forEach((stage) => {
        this.studyContentService.filterBy(stage.id).subscribe((contents) => {
          if (contents.length > 0) {
            stagesWithContent.push(stage);
          }

          processedCount++;

          if (processedCount === allStages.length) {
            this.stagesWithContent =
              this.sortStages(stagesWithContent);
          }
        });
      });
    });
  }

  private sortStages(stages: Stage[]): Stage[] {
    return stages.sort(
      (a, b) =>
        this.extractStageNumber(a.number) -
        this.extractStageNumber(b.number),
    );
  }

  private extractStageNumber(stageLabel: string): number {
    return (
      parseFloat(
        stageLabel.replace(/[^0-9.]/g, ''),
      ) || 0
    );
  }

  onStudentSearchChange(term: string): void {
    this.selectedStudent = null;
    this.selectedStudentId = null;
    this.isStudentFieldInvalid = false;
    this.studentSearchInput$.next(term);
  }

  fetchFilteredStudents(term: string): void {
    const query = term.trim().toLowerCase();

    if (query.length < 2) {
      this.filteredStudents = [];
      this.showStudentDropdown = false;
      return;
    }

    this.usersService
      .searchUsers(
        0,
        20,
        undefined,
        query,
        query,
        undefined,
        UserRole.STUDENT,
      )
      .subscribe({
        next: (res) => {
          this.filteredStudents = res.users;
          this.showStudentDropdown =
            this.filteredStudents.length > 0;
        },
        error: () => {
          this.filteredStudents = [];
          this.showStudentDropdown = false;
        },
      });
  }

  onStudentSelected(user: UserDto): void {
    this.selectedStudent = user;
    this.selectedStudentId =
      user.student?.id
        ? Number(user.student.id)
        : Number(user.id);

    this.filteredStudents = [];
    this.showStudentDropdown = false;
    this.isStudentFieldInvalid = false;
  }

  hideStudentDropdown(): void {
    setTimeout(() => {
      this.showStudentDropdown = false;
    }, 200);
  }

  handleStageSelected(stageText: string): void {
    this.stageDescription = stageText;
  }

  handleAssessmentSearch(
    filters: {
      studentId: number | null;
      stageId?: number;
      type: AssessmentType | null;
      from?: string;
      to?: string;
    },
  ): void {
    const studentId =
      this.selectedStudentId ??
      filters.studentId;

    this.isStudentSelected =
      studentId !== null;

    this.selectedStudentId =
      studentId;

    this.selectedStageId =
      filters.stageId ?? null;

    this.platformAssessments = [];
    this.editingAssessment = null;
    this.page = 1;

    const params: FilterAssessmentI = {
      ...(studentId !== null && {
        studentId: studentId.toString(),
      }),
      ...(filters.stageId !== undefined && {
        stageId: filters.stageId.toString(),
      }),
      ...(filters.type && {
        type: filters.type,
      }),
      ...(filters.from && {
        from: filters.from,
      }),
      ...(filters.to && {
        to: filters.to,
      }),
    };

    this.assessmentService.findAll(params).subscribe({
      next: (result) => {

        this.assessments =
          [...result].sort(
            (a, b) => {

              const dateA =
                new Date(
                  a.createdAt ?? 0,
                ).getTime();

              const dateB =
                new Date(
                  b.createdAt ?? 0,
                ).getTime();

              return dateB - dateA;
            },
          );

        this.page = 1;

        if (
          this.isStudentSelected &&
          this.assessments.length > 0
        ) {

          const student =
            this.assessments[0]
              .student;

          const currentStageId =
            student?.stageId ??
            null;

          this.highlightStageId =
            currentStageId;

        } else {

          this.highlightStageId =
            this.selectedStageId;
        }
      },
      error: () => {
        this.showModal(
          this.createModalParams(
            true,
            'Error al obtener las evaluaciones.',
          ),
        );
      },
    });

    if (studentId != null) {
      this.loadPlatformAssessments(studentId);
    }
  }

  private loadPlatformAssessments(
    studentId: number,
  ): void {
    this.platformAssessmentService
      .getAll(studentId)
      .subscribe({
        next: (list) => {
          this.platformAssessments =
            (list ?? []).filter(
              (a) =>
                a.status === 'completed' ||
                a.points != null,
            );
        },
        error: () => {
          this.platformAssessments = [];
        },
      });
  }

  refreshPlatformAssessments(): void {
    if (this.selectedStudentId == null) {
      this.showModal(
        this.createModalParams(
          true,
          'Selecciona un estudiante para actualizar las evaluaciones de plataforma.',
        ),
      );

      return;
    }

    this.loadPlatformAssessments(
      this.selectedStudentId,
    );
  }

  showModal(params: ModalDto): void {
    this.modal = { ...params };

    setTimeout(() => {
      this.modal.close();
    }, 2500);
  }

  closeModal = () => {
    this.modal = {
      ...modalInitializer(),
    };
  };

  createModalParams(
    isError: boolean,
    message: string,
  ): ModalDto {
    return {
      ...this.modal,
      show: true,
      isError,
      isSuccess: !isError,
      message,
      close: this.closeModal,
    };
  }

  isS2sAssessment(a: AssessementI): boolean {
    return (
      !!a.note &&
      typeof a.note === 'object' &&
      (
        a.note as {
          source?: string;
        }
      ).source === 's2s'
    );
  }

  showEvaluationDetails(a: AssessementI): void {
    const instructorName = a.instructor?.user
      ? `${a.instructor.user.firstName} ${a.instructor.user.lastName}`
      : 'Instructor no disponible';

    const formattedDate = a.createdAt
      ? new Date(a.createdAt).toLocaleDateString('es-EC', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : 'Fecha no disponible';

    const points = Number(a.points ?? 0);
    const minimum = this.minPointsAssessment ?? 0;
    const maximum = this.maxPointsAssessment ?? 100;
    const passed = points >= minimum;

    const statusLabel = passed
      ? 'Aprobada'
      : 'No aprobada';

    const statusStyle = passed
      ? 'color:#166534;background:#dcfce7;border:1px solid #bbf7d0;'
      : 'color:#991b1b;background:#fee2e2;border:1px solid #fecaca;';

    const s2s = this.isS2sAssessment(a);

    const noteObj =
      a.note && typeof a.note === 'object'
        ? (a.note as Record<string, unknown>)
        : null;

    const noteText =
      typeof a.note === 'string'
        ? a.note.trim()
        : String(
            noteObj?.['comment'] ??
            noteObj?.['observation'] ??
            noteObj?.['description'] ??
            '',
          ).trim();

    const assessmentType =
      a.assessmentType?.name ||
      a.type ||
      'Sin tipo';

    const valueStyle = `
      color:#34374d !important;
      font-weight:600 !important;
    `;

    const labelStyle = `
      color:#7b7f92 !important;
      font-weight:500 !important;
    `;

    const row = (
      label: string,
      value: string | number,
    ) => `
      <div style="
        display:flex;
        align-items:center;
        gap:6px;
        min-height:22px;
      ">
        <span style="${labelStyle}">
          ${label}:
        </span>

        <span style="${valueStyle}">
          ${value}
        </span>
      </div>
    `;

    const message = `
      <div style="
        display:flex;
        flex-direction:column;
        gap:7px;
        text-align:left;
      ">

        ${row('Instructor', instructorName)}
        ${row('Fecha', formattedDate)}
        ${row('Tipo', assessmentType)}
        ${row('Stage', a.stageId ?? '—')}
        ${row('Nota', `${points} / ${maximum}`)}

        <div style="
          display:flex;
          align-items:center;
          gap:6px;
          min-height:22px;
        ">
          <span style="${labelStyle}">
            Estado:
          </span>

          <span style="
            display:inline-flex !important;
            align-items:center !important;
            padding:3px 8px !important;
            ${statusStyle}
            border-radius:999px !important;
            font-size:11px !important;
            font-weight:700 !important;
            line-height:1.2 !important;
          ">
            ${statusLabel}
          </span>
        </div>

        ${
          s2s
            ? row('Origen', 'Plataforma S2S')
            : ''
        }

        <div style="
          margin-top:5px;
          padding-top:9px;
          border-top:1px solid #eceef3;
        ">
          <span style="${labelStyle}">
            Comentario:
          </span>

          <div style="
            margin-top:4px;
            ${valueStyle}
            line-height:1.45;
          ">
            ${noteText || 'Sin comentario registrado'}
          </div>
        </div>

      </div>
    `;

    this.modal = {
      ...modalInitializer(),
      show: true,
      isContentViewer: true,
      isError: false,
      title: 'Detalle de Evaluación',
      message,
      close: this.closeModal,
    };
  }
  startEditScore(a: AssessementI): void {
    this.editingAssessment = a;
    this.editPoints = a.points ?? null;
  }

  cancelEditScore(): void {
    this.editingAssessment = null;
    this.editPoints = null;
  }

  saveEditScore(): void {
    if (
      !this.editingAssessment ||
      this.editPoints == null
    ) {
      return;
    }

    const points =
      Number(this.editPoints);

    if (
      !Number.isInteger(points) ||
      points < 0 ||
      points > 100
    ) {
      this.showModal(
        this.createModalParams(
          true,
          'La nota debe ser un entero entre 0 y 100.',
        ),
      );
      return;
    }

    this.assessmentService
      .update(
        this.editingAssessment.id,
        { points },
      )
      .subscribe({
        next: () => {
          this.cancelEditScore();

          this.showModal(
            this.createModalParams(
              false,
              'Nota actualizada correctamente.',
            ),
          );

          this.refreshStudentData();
        },
        error: () => {
          this.showModal(
            this.createModalParams(
              true,
              'Error al actualizar la nota.',
            ),
          );
        },
      });
  }

  startApplyPlatform(
    row: PlatformAssessmentAssignment,
  ): void {
    this.applyingPlatformId = row.id;

    this.applyPointsOverride =
      row.writingApplied
        ? (
            row.writingPoints ??
            row.points ??
            null
          )
        : (
            row.points ??
            null
          );
  }

  cancelApplyPlatform(): void {
    this.applyingPlatformId = null;
    this.applyPointsOverride = null;
  }

  canShowWritingAction(
    row: PlatformAssessmentAssignment,
  ): boolean {
    return (
      row.points != null ||
      row.writingApplied === true
    );
  }

  writingActionLabel(
    row: PlatformAssessmentAssignment,
  ): string {
    return row.writingApplied
      ? 'Corregir Writing'
      : 'Aplicar Writing';
  }

  writingPointsMismatch(
    row: PlatformAssessmentAssignment,
  ): boolean {
    return (
      row.writingApplied === true &&
      row.points != null &&
      row.writingPoints != null &&
      row.points !== row.writingPoints
    );
  }

  confirmApplyPlatform(
    row: PlatformAssessmentAssignment,
  ): void {
    const override =
      this.applyPointsOverride != null
        ? Number(this.applyPointsOverride)
        : undefined;

    if (
      override !== undefined &&
      (
        !Number.isInteger(override) ||
        override < 0 ||
        override > 100
      )
    ) {
      this.showModal(
        this.createModalParams(
          true,
          'La nota debe ser un entero entre 0 y 100.',
        ),
      );
      return;
    }

    const correcting =
      row.writingApplied === true;

    this.modal = {
      ...modalInitializer(),
      show: true,
      isInfo: true,
      title:
        correcting
          ? '¿Corregir Writing?'
          : '¿Aplicar Writing?',
      message:
        correcting
          ? `Se actualizará la Writing existente a ${override ?? row.points ?? '—'} puntos (corrección admin).`
          : `Se creará Writing con ${override ?? row.points ?? '—'} puntos desde el resultado S2S.`,
      showButtons: true,
      confirm: () =>
        this.applyPlatformWriting(
          row,
          override,
        ),
      close: this.closeModal,
    };
  }

  private applyPlatformWriting(
    row: PlatformAssessmentAssignment,
    points?: number,
  ): void {
    this.platformAssessmentService
      .applyWritingScore(
        row.id,
        points,
      )
      .subscribe({
        next: (res) => {
          this.closeModal();
          this.cancelApplyPlatform();

          const action =
            res.created
              ? 'creada'
              : 'corregida';

          const promo =
            res.updatedStage
              ? ' Stage promovido.'
              : ' Stage sin cambio.';

          this.showModal(
            this.createModalParams(
              false,
              `Writing ${action} con ${res.points} puntos.${promo}`,
            ),
          );

          this.refreshStudentData();
        },
        error: (err) => {
          this.closeModal();

          const msg =
            err?.error?.message ||
            'Error al aplicar/corregir Writing desde la plataforma.';

          setTimeout(() => {
            this.showModal(
              this.createModalParams(
                true,
                msg,
              ),
            );
          }, 200);
        },
      });
  }

  private refreshStudentData(): void {
    if (
      this.selectedStudentId == null
    ) {
      return;
    }

    this.handleAssessmentSearch({
      studentId:
        this.selectedStudentId,
      stageId:
        this.selectedStageId ??
        undefined,
      type: null,
    });
  }

  deleteAssessment(id: number): void {
    this.assessmentService
      .delete(id)
      .subscribe({
        next: () => {
          this.closeModal();
          this.refreshStudentData();
        },
        error: () => {
          this.closeModal();

          setTimeout(() => {
            this.showModal(
              this.createModalParams(
                true,
                'Error al eliminar la evaluación.',
              ),
            );
          }, 200);
        },
      });
  }

  confirmDelete(
    assessment: AssessementI,
  ): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      isInfo: true,
      title: '¿Eliminar evaluación?',
      message:
        `¿Estás seguro de eliminar la evaluación de tipo "${assessment.type}" con nota ${assessment.points}?`,
      showButtons: true,
      confirm: () =>
        this.deleteAssessment(
          assessment.id,
        ),
      close: this.closeModal,
    };
  }

  get pagedAssessments(): AssessementI[] {
    const start =
      (this.page - 1) *
      this.limit;

    return this.assessments.slice(
      start,
      start + this.limit,
    );
  }

  get total(): number {
    return this.assessments.length;
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(
        this.total /
        this.limit,
      ),
    );
  }

  get canPrev(): boolean {
    return this.page > 1;
  }

  get canNext(): boolean {
    return (
      this.page <
      this.totalPages
    );
  }

  get startIndex(): number {
    if (!this.total) {
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
      this.total,
    );
  }

  get paginationLabel(): string {
    if (!this.total) {
      return '0 evaluaciones';
    }

    return (
      `Mostrando ${this.startIndex} a ${this.endIndex} ` +
      `de ${this.total} evaluaciones`
    );
  }

  onPrev(): void {
    if (!this.canPrev) {
      return;
    }

    this.page--;
  }

  onNext(): void {
    if (!this.canNext) {
      return;
    }

    this.page++;
  }

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

  onLimitChange(
    value: number,
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
    this.page = 1;
  }
}