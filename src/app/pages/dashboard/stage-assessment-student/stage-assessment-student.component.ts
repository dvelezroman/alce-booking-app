import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { UserDto } from '../../../services/dtos/user.dto';
import { StageAssessmentService } from '../../../services/stage-assessment.service';
import { selectUserData } from '../../../store/user.selector';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';

import { StageAssessment } from '../../../services/dtos/stage-assessment.dto';
import { StageAssessmentCardComponent } from '../../../components/stage-assessment/stage-assessment-card/stage-assessment-card.component';

@Component({
  selector: 'app-stage-assessment-student',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    StageAssessmentCardComponent,
  ],
  templateUrl: './stage-assessment-student.component.html',
  styleUrls: ['./stage-assessment-student.component.scss']
})
export class StageAssessmentStudentComponent implements OnInit {

  studentId: number | null = null;
  hasActiveAssessments: boolean = false;

  assessments: StageAssessment[] = [];

  modal: ModalDto = modalInitializer();

  constructor(
    private store: Store,
    private stageAssessmentService: StageAssessmentService,
  ) {}

  ngOnInit(): void {
    this.store.select(selectUserData).pipe(take(1)).subscribe((u: UserDto | null) => {
      this.studentId = u?.student?.id ?? null;

      if (!this.studentId) {
        this.showNotification("No se pudo obtener tu información.", true);
        return;
      }

      this.loadAssessments();
    });
  }

  /** cargar los assessments del backend */
  private loadAssessments() {
    this.stageAssessmentService.checkActiveByStudent(this.studentId!).subscribe({
      next: (res) => {
        this.hasActiveAssessments = res.hasActive;
        this.assessments = res.assessments ?? [];

        console.log("Assessments recibidos:", this.assessments);
      },
      error: () => {
        this.showNotification("Error al obtener tus evaluaciones.", true);
      }
    });
  }

  /** parámetros que recibe del hijo */
  onOpenAndFinish(assessmentId: number) {
    this.stageAssessmentService.markFinished(assessmentId).subscribe({
      next: () => {
        this.showNotification("Evaluación marcada como completada.", false, true);

        // Recargar lista
        this.loadAssessments();
      },
      error: () => {
        this.showNotification("Error al marcar como completado.", true);
      }
    });
  }

  private showNotification(message: string, isError = false, isSuccess = false) {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message,
      isError,
      isSuccess,
      isInfo: !isError && !isSuccess,
      close: () => (this.modal.show = false)
    };

    setTimeout(() => (this.modal.show = false), 2500);
  }

}