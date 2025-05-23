import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AssessmentService } from '../../services/assessment.service';
import { AssessementI, AssessmentType, FilterAssessmentI } from '../../services/dtos/assessment.dto';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { ModalComponent } from '../../components/modal/modal.component';
import { AssessmentReportFormComponent } from '../../components/assessment-reports/assessment-report-form/assessment-report-form.component';
import { AssessmentPointsConfigService } from '../../services/assessment-points-config.service';
import { AssessmentTableReportsComponent } from '../../components/assessment-reports/assessment-table-reports/assessment-table-reports.component';
import { Instructor } from '../../services/dtos/instructor.dto';
import { InstructorsService } from '../../services/instructors.service';

@Component({
  selector: 'app-assessment-reports',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    AssessmentTableReportsComponent,
    AssessmentReportFormComponent
  ],
  templateUrl: './assessment-reports.component.html',
  styleUrl: './assessment-reports.component.scss',
})
export class AssessmentReportsComponent{
  modal: ModalDto = modalInitializer();
  instructorId: number | null = null;
  assessments: AssessementI[] = [];
  maxPointsAssessment: number | null = null;

  constructor(
    private assessmentService: AssessmentService,
    private instructorsService: InstructorsService,
    private assessmentPointsConfigService: AssessmentPointsConfigService
  ) {
  }

   ngOnInit(): void {
    this.loadAssessmentConfig();
  }

   loadAssessmentConfig(): void {
    this.assessmentPointsConfigService.getById().subscribe({
      next: (config) => {
        this.maxPointsAssessment = config.maxPointsAssessment;
        //console.log('maxPointsAssessment:', this.maxPointsAssessment);
      },
      error: () => {
        this.showModal(
          this.createModalParams(true, 'Error al cargar configuración.')
        );
      }
    });
  }

  handleAssessmentSearch(filters: {
    studentId: number | null;
    stageId: number;
    type: AssessmentType | null;
  }): void {
    const params: FilterAssessmentI = {
      stageId: filters.stageId.toString()
    };

    if (filters.studentId !== null) {
      params.studentId = filters.studentId.toString();
    }

    if (filters.type !== null) {
      params.type = filters.type;
    }

    this.assessmentService.findAll(params).subscribe({
      next: (result) => {
        this.assessments = result;
      },
      error: () => {
        this.showModal(
          this.createModalParams(true, 'Error al obtener las evaluaciones.')
        );
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
      <span >Instructor:</span> ${instructorName}<br>
      <span >Fecha:</span> ${formattedDate}<br>
      <span >Nota:</span> ${a.points}<br>
      ${a.note ? `<span >Comentario:</span> ${a.note}` : ''}
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
}
