import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { filter, take } from 'rxjs';
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
  loading: boolean = true;

  assessments: StageAssessment[] = [];

  modal: ModalDto = modalInitializer();

  constructor(
    private store: Store,
    private stageAssessmentService: StageAssessmentService,
  ) {}

  ngOnInit(): void {
    this.store.select(selectUserData)
      .pipe(
        filter((u): u is UserDto => !!u),
        take(1)
      )
      .subscribe((u) => {
        this.studentId = u.student?.id ?? null;

        if (!this.studentId) {
          this.showNotification("No se pudo obtener tu información.", true);
          return;
        }

        this.loadAssessments();
      });
  }

  /** cargar los assessments del backend */
  private loadAssessments() {
    this.loading = true;
    this.stageAssessmentService.checkActiveByStudent(this.studentId!).subscribe({
      next: (res) => {
        this.hasActiveAssessments = res.hasActive;
        this.assessments = res.assessments ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showNotification("Error al obtener tus evaluaciones.", true);
      }
    });
  }

 /** parámetros que recibe del hijo */
  onOpenAndFinish(assessmentId: number) {
    if (!this.studentId) return;

    this.stageAssessmentService.markFinished(assessmentId, this.studentId).subscribe({
      next: () => {
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