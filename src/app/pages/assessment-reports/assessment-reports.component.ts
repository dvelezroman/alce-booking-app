import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AssessmentService } from '../../services/assessment.service';
import { AssessementI, AssessmentType, FilterAssessmentI } from '../../services/dtos/assessment.dto';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { ModalComponent } from '../../components/modal/modal.component';
import { AssessmentTableComponent } from '../../components/assessment/assessment-table/assessment-table.component';
import { AssessmentReportFormComponent } from '../../components/assessment-report-form/assessment-report-form.component';

@Component({
  selector: 'app-assessment-reports',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    AssessmentTableComponent,
    AssessmentReportFormComponent
  ],
  templateUrl: './assessment-reports.component.html',
  styleUrl: './assessment-reports.component.scss',
})
export class AssessmentReportsComponent{
  modal: ModalDto = modalInitializer();
  instructorId: number | null = null;
  assessments: AssessementI[] = [];

  constructor(
    private store: Store,
    private assessmentService: AssessmentService
  ) {
  }

  handleAssessmentSearch(filters: {
    studentId: number;
    stageId: number;
    type: string;
  }): void {
    const params: FilterAssessmentI = {
      studentId: filters.studentId.toString(),
      stageId: filters.stageId.toString(),
      type: filters.type as AssessmentType
    };

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
