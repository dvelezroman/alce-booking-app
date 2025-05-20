import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AssessmentFormComponent } from '../../components/assessment/assessment-form/assessment-form.component';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../store/user.selector';
import { UserDto } from '../../services/dtos/user.dto';
import { AssessmentService } from '../../services/assessment.service';
import { AssessmentPointsConfigService } from '../../services/assessment-points-config.service';
import { AssessementI, CreateAssessmentI, FilterAssessmentI } from '../../services/dtos/assessment.dto';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { ModalComponent } from '../../components/modal/modal.component';
import { AssessmentTableComponent } from '../../components/assessment/assessment-table/assessment-table.component';

@Component({
  selector: 'app-assessment',
  standalone: true,
  imports: [CommonModule, 
            AssessmentFormComponent, 
            ModalComponent,
            AssessmentTableComponent
          ],
  templateUrl: './assessment.component.html',
  styleUrl: './assessment.component.scss',
})
export class AssessmentComponent {
  modal: ModalDto = modalInitializer();
  instructorId: number | null = null;
  assessments: AssessementI[] = [];

  constructor(
    private store: Store,
    private assessmentService: AssessmentService,
    private assessmentPointsConfigService: AssessmentPointsConfigService
  ) {
    this.store.select(selectUserData).subscribe((user: UserDto | null) => {
      if (user?.instructor?.id) {
        this.instructorId = user.instructor.id;
      }
    });
  }

  handleAssessmentCreated(payload: CreateAssessmentI): void {
    this.assessmentService.create(payload).subscribe({
      next: () => {
        this.showModal(
          this.createModalParams(false, 'Evaluación registrada correctamente.')
        );
        this.fetchAssessments( payload.studentId.toString(),payload.stageId.toString(), payload.instructorId.toString());
      },
      error: () => {
        this.showModal(
          this.createModalParams(true, 'Error al registrar la evaluación.')
        );
      },
    });
  }

  fetchAssessments(studentId: string, stageId: string, instructorId: string) {
    const params: FilterAssessmentI = {
      studentId,
      stageId,
      instructorId
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
