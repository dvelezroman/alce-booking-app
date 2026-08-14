import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../components/modal/modal.component';
import { AssessmentTableReportsComponent } from '../../../components/assessment-reports/assessment-table-reports/assessment-table-reports.component';
import { AssessmentMultiTableComponent } from '../../../components/assessment-reports/assessment-multiTable/assessment-multi-table.component';
import { AssessmentReportFormComponent } from '../../../components/assessment-reports/assessment-report-form/assessment-report-form.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import {
  AssessementI,
  AssessmentType,
  FilterAssessmentI,
} from '../../../services/dtos/assessment.dto';
import { PlatformAssessmentAssignment } from '../../../services/dtos/platform-assessment.dto';
import { Stage } from '../../../services/dtos/student.dto';
import { AssessmentService } from '../../../services/assessment.service';
import { PlatformAssessmentService } from '../../../services/platform-assessment.service';
import { StudyContentService } from '../../../services/study-content.service';
import { StagesService } from '../../../services/stages.service';
import { AssessmentPointsConfigService } from '../../../services/assessment-points-config.service';

@Component({
  selector: 'app-assessment-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    AssessmentTableReportsComponent,
    AssessmentReportFormComponent,
    AssessmentMultiTableComponent,
  ],
  templateUrl: './assessment-reports.component.html',
  styleUrl: './assessment-reports.component.scss',
})
export class AssessmentReportsComponent {
  modal: ModalDto = modalInitializer();
  instructorId: number | null = null;
  assessments: AssessementI[] = [];
  platformAssessments: PlatformAssessmentAssignment[] = [];
  allStages: Stage[] = [];
  platformListCollapsed = false;
  platformFilterStageId: number | undefined;
  platformFilterAccepted: '' | 'accepted' | 'pending' = '';
  maxPointsAssessment: number | null = null;
  minPointsAssessment: number | null = null;
  isStudentSelected: boolean = false;
  stageDescription: string = '';
  selectedStageId: number | null = null;
  selectedStudentId: number | null = null;
  highlightStageId: number | null = null;
  stagesWithContent: Stage[] = [];

  editingAssessment: AssessementI | null = null;
  editPoints: number | null = null;
  applyingPlatformId: number | null = null;
  applyPointsOverride: number | null = null;

  constructor(
    private assessmentService: AssessmentService,
    private platformAssessmentService: PlatformAssessmentService,
    private studyContentService: StudyContentService,
    private stagesService: StagesService,
    private assessmentPointsConfigService: AssessmentPointsConfigService,
  ) {}

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
          this.createModalParams(true, 'Error al cargar configuración.'),
        );
      },
    });
  }

  loadStagesWithContent(): void {
    this.stagesService.getAll().subscribe((allStages) => {
      this.allStages = allStages;
      const stagesWithContent: Stage[] = [];
      let processedCount = 0;

      allStages.forEach((stage) => {
        this.studyContentService.filterBy(stage.id).subscribe((contents) => {
          if (contents.length > 0) {
            stagesWithContent.push(stage);
          }

          processedCount++;
          if (processedCount === allStages.length) {
            this.stagesWithContent = this.sortStages(stagesWithContent);
          }
        });
      });
    });
  }

  private sortStages(stages: Stage[]): Stage[] {
    return stages.sort(
      (a, b) =>
        this.extractStageNumber(a.number) - this.extractStageNumber(b.number),
    );
  }

  private extractStageNumber(stageLabel: string): number {
    return parseFloat(stageLabel.replace(/[^0-9.]/g, '')) || 0;
  }

  handleStageSelected(stageText: string): void {
    this.stageDescription = stageText;
  }

  handleAssessmentSearch(filters: {
    studentId: number | null;
    stageId?: number;
    type: AssessmentType | null;
  }): void {
    this.isStudentSelected = filters.studentId !== null;
    this.selectedStudentId = filters.studentId;
    this.selectedStageId = filters.stageId ?? null;
    this.platformAssessments = [];
    this.platformFilterStageId = undefined;
    this.platformFilterAccepted = '';
    this.editingAssessment = null;

    const params: FilterAssessmentI = {
      ...(filters.studentId !== null && {
        studentId: filters.studentId.toString(),
      }),
      ...(filters.stageId !== undefined && {
        stageId: filters.stageId.toString(),
      }),
      ...(filters.type && { type: filters.type }),
    };

    this.assessmentService.findAll(params).subscribe({
      next: (result) => {
        this.assessments = result;

        if (this.isStudentSelected && result.length > 0) {
          const student = result[0].student;
          const currentStageId = student?.stageId ?? null;
          this.highlightStageId = currentStageId;
        } else {
          this.highlightStageId = this.selectedStageId;
        }
      },
      error: () => {
        this.showModal(
          this.createModalParams(true, 'Error al obtener las evaluaciones.'),
        );
      },
    });

    if (filters.studentId != null) {
      this.loadPlatformAssessments(filters.studentId);
    }
  }

  private loadPlatformAssessments(studentId: number): void {
    this.platformAssessmentService.syncFromRemote(studentId).subscribe({
      next: (list) => {
        this.platformAssessments = (list ?? []).filter(
          (a) => a.status === 'completed' || a.points != null,
        );
      },
      error: () => {
        this.platformAssessments = [];
      },
    });
  }

  togglePlatformList(): void {
    this.platformListCollapsed = !this.platformListCollapsed;
  }

  get platformStageFilterOptions(): Stage[] {
    const ids = new Set(
      this.platformAssessments
        .map((r) => r.studentStage)
        .filter((id): id is number => id != null),
    );
    return this.allStages
      .filter((s) => ids.has(s.id))
      .sort(
        (a, b) =>
          this.extractStageNumber(a.number) - this.extractStageNumber(b.number),
      );
  }

  get filteredPlatformAssessments(): PlatformAssessmentAssignment[] {
    return this.platformAssessments.filter((row) => {
      if (
        this.platformFilterStageId != null &&
        row.studentStage !== this.platformFilterStageId
      ) {
        return false;
      }
      if (this.platformFilterAccepted === 'accepted' && !row.writingAccepted) {
        return false;
      }
      if (this.platformFilterAccepted === 'pending' && row.writingAccepted) {
        return false;
      }
      return true;
    });
  }

  stageLabelForId(stageId: number | null | undefined): string {
    if (stageId == null) return '—';
    const stage = this.allStages.find((s) => s.id === stageId);
    if (!stage) return `Stage ${stageId}`;
    const desc = stage.description?.trim();
    return desc ? `${stage.number} — ${desc}` : stage.number;
  }

  showModal(params: ModalDto): void {
    this.modal = { ...params };
    setTimeout(() => {
      this.modal.close();
    }, 2500);
  }

  closeModal = () => {
    this.modal = { ...modalInitializer() };
  };

  createModalParams(isError: boolean, message: string): ModalDto {
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
      (a.note as { source?: string }).source === 's2s'
    );
  }

  showEvaluationDetails(a: AssessementI): void {
    const instructorName = a.instructor?.user
      ? `${a.instructor.user.lastName}, ${a.instructor.user.firstName}`
      : 'Instructor no disponible';

    const formattedDate = new Date(a.createdAt || '').toLocaleDateString();
    const s2s = this.isS2sAssessment(a);
    const noteObj =
      a.note != null && typeof a.note === 'object'
        ? (a.note as Record<string, unknown>)
        : null;
    const noteText =
      a.note == null
        ? ''
        : typeof a.note === 'string'
          ? a.note
          : JSON.stringify(a.note);
    const stageSignal =
      noteObj?.['studentStage'] != null
        ? `<span>Stage exam:</span> ${noteObj['studentStage']}<br>`
        : '';

    const message = `
      <span>Instructor:</span> ${instructorName}<br>
      <span>Fecha:</span> ${formattedDate}<br>
      <span>Nota:</span> ${a.points}<br>
      ${s2s ? '<span>Origen:</span> S2S (plataforma)<br>' : ''}
      ${stageSignal}
      ${noteText ? `<span>Comentario:</span> ${noteText}` : ''}
    `;

    this.modal = {
      ...modalInitializer(),
      show: true,
      isContentViewer: true,
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
    if (!this.editingAssessment || this.editPoints == null) return;
    const points = Number(this.editPoints);
    if (!Number.isInteger(points) || points < 0 || points > 100) {
      this.showModal(
        this.createModalParams(true, 'La nota debe ser un entero entre 0 y 100.'),
      );
      return;
    }

    this.assessmentService
      .update(this.editingAssessment.id, { points })
      .subscribe({
        next: () => {
          this.cancelEditScore();
          this.showModal(
            this.createModalParams(false, 'Nota actualizada correctamente.'),
          );
          this.refreshStudentData();
        },
        error: () => {
          this.showModal(
            this.createModalParams(true, 'Error al actualizar la nota.'),
          );
        },
      });
  }

  startApplyPlatform(row: PlatformAssessmentAssignment): void {
    if (!this.canShowWritingAction(row) || this.isWritingLocked(row)) {
      return;
    }
    this.applyingPlatformId = row.id;
    this.applyPointsOverride = row.points ?? null;
  }

  cancelApplyPlatform(): void {
    this.applyingPlatformId = null;
    this.applyPointsOverride = null;
  }

  canShowWritingAction(row: PlatformAssessmentAssignment): boolean {
    return row.points != null;
  }

  isWritingLocked(row: PlatformAssessmentAssignment): boolean {
    return row.writingAccepted === true;
  }

  writingActionLabel(row: PlatformAssessmentAssignment): string {
    return this.isWritingLocked(row) ? 'Aceptada' : 'Aceptar Evaluación';
  }

  writingPointsMismatch(row: PlatformAssessmentAssignment): boolean {
    return (
      row.writingApplied === true &&
      row.points != null &&
      row.writingPoints != null &&
      row.points !== row.writingPoints
    );
  }

  confirmApplyPlatform(row: PlatformAssessmentAssignment): void {
    const override =
      this.applyPointsOverride != null ? Number(this.applyPointsOverride) : undefined;
    if (
      override !== undefined &&
      (!Number.isInteger(override) || override < 0 || override > 100)
    ) {
      this.showModal(
        this.createModalParams(true, 'La nota debe ser un entero entre 0 y 100.'),
      );
      return;
    }

    if (this.isWritingLocked(row)) {
      return;
    }
    this.modal = {
      ...modalInitializer(),
      show: true,
      isInfo: true,
      title: '¿Aceptar Evaluación?',
      message: `Se creará Grammar con ${override ?? row.points ?? '—'} puntos desde el resultado S2S.`,
      showButtons: true,
      confirm: () => this.applyPlatformWriting(row, override),
      close: this.closeModal,
    };
  }

  private applyPlatformWriting(
    row: PlatformAssessmentAssignment,
    points?: number,
  ): void {
    this.platformAssessmentService.applyWritingScore(row.id, points).subscribe({
      next: (res) => {
        this.closeModal();
        this.cancelApplyPlatform();
        const promo = res.updatedStage
          ? ' Stage promovido.'
          : ' Stage sin cambio.';
        this.showModal(
          this.createModalParams(
            false,
            `Grammar creada con ${res.points} puntos.${promo}`,
          ),
        );
        this.refreshStudentData();
      },
      error: (err) => {
        this.closeModal();
        const msg =
          err?.error?.message ||
          'Error al registrar Grammar desde la plataforma.';
        setTimeout(() => {
          this.showModal(this.createModalParams(true, msg));
        }, 200);
      },
    });
  }

  private refreshStudentData(): void {
    if (this.selectedStudentId == null) return;
    this.handleAssessmentSearch({
      studentId: this.selectedStudentId,
      stageId: this.selectedStageId ?? undefined,
      type: null,
    });
  }

  deleteAssessment(id: number): void {
    this.assessmentService.delete(id).subscribe({
      next: () => {
        this.closeModal();
        this.refreshStudentData();
      },
      error: () => {
        this.closeModal();
        setTimeout(() => {
          this.showModal(
            this.createModalParams(true, 'Error al eliminar la evaluación.'),
          );
        }, 200);
      },
    });
  }

  confirmDelete(assessment: AssessementI): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      isInfo: true,
      title: '¿Eliminar evaluación?',
      message: `¿Estás seguro de eliminar la evaluación de tipo "${assessment.type}" con nota ${assessment.points}?`,
      showButtons: true,
      confirm: () => this.deleteAssessment(assessment.id),
      close: this.closeModal,
    };
  }
}
