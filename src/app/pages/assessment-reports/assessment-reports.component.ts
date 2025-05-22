import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AssessmentService } from '../../services/assessment.service';
import { AssessementI, AssessmentType, FilterAssessmentI } from '../../services/dtos/assessment.dto';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { ModalComponent } from '../../components/modal/modal.component';
import { AssessmentReportFormComponent } from '../../components/assessment-reports/assessment-report-form/assessment-report-form.component';
import { AssessmentPointsConfigService } from '../../services/assessment-points-config.service';
import { AssessmentTableReportsComponent } from '../../components/assessment-reports/assessment-table-reports/assessment-table-reports.component';

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
    studentId: number;
    stageId: number;
    type: AssessmentType | null;
  }): void {
    const params: FilterAssessmentI = {
      studentId: filters.studentId.toString(),
      stageId: filters.stageId.toString(),
      type: filters.type as AssessmentType
    };

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
}
