import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AssessmentFormComponent } from '../../components/assessment/assessment-form/assessment-form.component';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../store/user.selector';
import { UserDto } from '../../services/dtos/user.dto';
import { AssessmentService } from '../../services/assessment.service';
import { AssessmentPointsConfigService } from '../../services/assessment-points-config.service';
import { CreateAssessmentI } from '../../services/dtos/assessment.dto';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-assessment',
  standalone: true,
  imports: [CommonModule, 
            AssessmentFormComponent,
            ModalComponent
          ],
  templateUrl: './assessment.component.html',
  styleUrl: './assessment.component.scss'
})
export class AssessmentComponent {
  modal: ModalDto = modalInitializer();
  instructorId: number | null = null;

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
        this.showModal(this.createModalParams(false, 'Evaluación registrada correctamente.'));
      },
      error: () => {
        this.showModal(this.createModalParams(true, 'Error al registrar la evaluación.'));
      }
    });
  }

  showModal(params: ModalDto): void {
    this.modal = { ...params };
    setTimeout(() => {
      this.modal.close();
    }, 1500);
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