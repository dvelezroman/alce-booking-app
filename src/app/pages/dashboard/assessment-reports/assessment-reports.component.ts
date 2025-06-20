import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ModalComponent } from '../../../components/modal/modal.component';
import { AssessmentTableReportsComponent } from '../../../components/assessment-reports/assessment-table-reports/assessment-table-reports.component';
import { AssessmentMultiTableComponent } from '../../../components/assessment-reports/assessment-multiTable/assessment-multi-table.component';
import { AssessmentReportFormComponent } from '../../../components/assessment-reports/assessment-report-form/assessment-report-form.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { AssessementI, AssessmentType, FilterAssessmentI } from '../../../services/dtos/assessment.dto';
import { Stage } from '../../../services/dtos/student.dto';
import { AssessmentService } from '../../../services/assessment.service';
import { StudyContentService } from '../../../services/study-content.service';
import { StagesService } from '../../../services/stages.service';
import { AssessmentPointsConfigService } from '../../../services/assessment-points-config.service';


@Component({
  selector: 'app-assessment-reports',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    AssessmentTableReportsComponent,
    AssessmentReportFormComponent,
    AssessmentMultiTableComponent
  ],
  templateUrl: './assessment-reports.component.html',
  styleUrl: './assessment-reports.component.scss',
})
export class AssessmentReportsComponent {
  modal: ModalDto = modalInitializer();
  instructorId: number | null = null;
  assessments: AssessementI[] = [];
  maxPointsAssessment: number | null = null;
  minPointsAssessment: number | null = null;
  isStudentSelected: boolean = false;
  stageDescription: string = '';
  selectedStageId: number | null = null;
  selectedStudentId: number | null = null;
  stagesWithContent: Stage[] = [];

  constructor(
    private assessmentService: AssessmentService,
    private studyContentService: StudyContentService,
    private stagesService: StagesService,
    private assessmentPointsConfigService: AssessmentPointsConfigService
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
        this.showModal(this.createModalParams(true, 'Error al cargar configuración.'));
      }
    });
  }

  loadStagesWithContent(): void {
    this.stagesService.getAll().subscribe(allStages => {
      const stagesWithContent: Stage[] = [];
      let processedCount = 0;

      allStages.forEach(stage => {
        this.studyContentService.filterBy(stage.id).subscribe(contents => {
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
    return stages.sort((a, b) => this.extractStageNumber(a.number) - this.extractStageNumber(b.number));
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

    const params: FilterAssessmentI = {
      ...(filters.studentId !== null && { studentId: filters.studentId.toString() }),
      ...(filters.type && { type: filters.type })
    };

    this.assessmentService.findAll(params).subscribe({
      next: (result) => {
        this.assessments = result; 
      },
      error: () => {
        this.showModal(this.createModalParams(true, 'Error al obtener las evaluaciones.'));
      }
    });
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

  showEvaluationDetails(a: AssessementI): void {
    const instructorName = a.instructor?.user
      ? `${a.instructor.user.lastName}, ${a.instructor.user.firstName}`
      : 'Instructor no disponible';

    const formattedDate = new Date(a.createdAt || '').toLocaleDateString();

    const message = `
      <span>Instructor:</span> ${instructorName}<br>
      <span>Fecha:</span> ${formattedDate}<br>
      <span>Nota:</span> ${a.points}<br>
      ${a.note ? `<span>Comentario:</span> ${a.note}` : ''}
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

  deleteAssessment(id: number): void {
    this.assessmentService.delete(id).subscribe({
      next: () => {
        this.closeModal(); 
        this.handleAssessmentSearch({
          studentId: this.selectedStudentId,
          stageId: this.selectedStageId ?? undefined,
          type: null
        });
      },
      error: () => {
        this.closeModal();
        setTimeout(() => {
          this.showModal(this.createModalParams(true, 'Error al eliminar la evaluación.'));
        }, 200);
      }
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