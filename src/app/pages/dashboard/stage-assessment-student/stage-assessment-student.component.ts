import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, take } from 'rxjs';

import { ModalComponent } from '../../../components/modal/modal.component';
import {
  ModalDto,
  modalInitializer,
} from '../../../components/modal/modal.dto';

import { AssessmentHeaderComponent } from '../../../components/assessment-student/assessment-header/assessment-header.component';
import { AssessmentSummaryComponent } from '../../../components/assessment-student/assessment-summary/assessment-summary.component';
import { AssessmentSectionComponent } from '../../../components/assessment-student/assessment-section/assessment-section.component';
import { AssessmentSupportComponent } from '../../../components/assessment-student/assessment-support/assessment-support.component';

import { StageAssessment } from '../../../services/dtos/stage-assessment.dto';
import { UserDto } from '../../../services/dtos/user.dto';
import { StageAssessmentService } from '../../../services/stage-assessment.service';

import { selectUserData } from '../../../store/user.selector';

@Component({
  selector: 'app-stage-assessment-student',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    AssessmentHeaderComponent,
    AssessmentSummaryComponent,
    AssessmentSectionComponent,
    AssessmentSupportComponent,
  ],
  templateUrl: './stage-assessment-student.component.html',
  styleUrls: ['./stage-assessment-student.component.scss'],
})
export class StageAssessmentStudentComponent implements OnInit {
  studentId: number | null = null;

  loading = true;

  pendingAssessments: StageAssessment[] = [];
  expiredAssessments: StageAssessment[] = [];
  completedAssessments: StageAssessment[] = [];

  activeCount = 0;
  expiredCount = 0;
  completedCount = 0;

  hasPending = false;
  hasExpired = false;
  hasCompleted = false;

  highlightId: number | null = null;

  modal: ModalDto = modalInitializer();

  constructor(
    private readonly store: Store,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly stageAssessmentService: StageAssessmentService,
  ) {}

  ngOnInit(): void {
    this.getHighlightAssessment();
    this.getStudent();
  }

  private getHighlightAssessment(): void {
    this.route.queryParams.subscribe((params) => {
      const highlight = Number(params['highlight']);

      this.highlightId =
        Number.isFinite(highlight) && highlight > 0
          ? highlight
          : null;
    });
  }

  private getStudent(): void {
    this.store
      .select(selectUserData)
      .pipe(
        filter((user): user is UserDto => !!user),
        take(1),
      )
      .subscribe((user) => {
        this.studentId = user.student?.id ?? null;

        if (!this.studentId) {
          this.loading = false;

          this.showNotification(
            'No se pudo obtener tu información.',
            true,
          );

          return;
        }

        this.loadAssessments();
      });
  }

  private loadAssessments(): void {
    if (!this.studentId) {
      return;
    }

    this.loading = true;

    this.stageAssessmentService
      .getAll({
        studentId: this.studentId,
      })
      .subscribe({
        next: (list) => {
          const sortedAssessments = [...(list ?? [])].sort(
            (firstAssessment, secondAssessment) =>
              this.getDueDateTimestamp(secondAssessment) -
              this.getDueDateTimestamp(firstAssessment),
          );

          this.pendingAssessments =
            sortedAssessments.filter(
              (assessment) =>
                assessment.statusForStudent === 'active',
            );

          this.expiredAssessments =
            sortedAssessments.filter(
              (assessment) =>
                assessment.statusForStudent === 'agedOut',
            );

          this.completedAssessments =
            sortedAssessments.filter(
              (assessment) =>
                assessment.statusForStudent === 'completed',
            );

          this.updateAssessmentCounters();

          this.loading = false;
        },
        error: () => {
          this.resetAssessments();
          this.loading = false;

          this.showNotification(
            'Error al obtener evaluaciones.',
            true,
          );
        },
      });
  }

  private updateAssessmentCounters(): void {
    this.activeCount = this.pendingAssessments.length;
    this.expiredCount = this.expiredAssessments.length;
    this.completedCount = this.completedAssessments.length;

    this.hasPending = this.activeCount > 0;
    this.hasExpired = this.expiredCount > 0;
    this.hasCompleted = this.completedCount > 0;
  }

  private resetAssessments(): void {
    this.pendingAssessments = [];
    this.expiredAssessments = [];
    this.completedAssessments = [];

    this.updateAssessmentCounters();
  }

  private getDueDateTimestamp(
    assessment: StageAssessment,
  ): number {
    if (!assessment.dueDate) {
      return 0;
    }

    const timestamp = new Date(
      assessment.dueDate,
    ).getTime();

    return Number.isNaN(timestamp)
      ? 0
      : timestamp;
  }

  onOpenAssessment(assessment: StageAssessment): void {
    this.onOpenAndFinish(assessment.id);
  }

  onViewAssessmentDetail(
    assessment: StageAssessment,
  ): void {
    /*
     * Aquí colocaremos la ruta real del detalle cuando
     * conectemos el evento emitido por el componente hijo.
     *
     * Ejemplo:
     *
     * this.router.navigate([
     *   '/dashboard/stage-assessment-student',
     *   assessment.id,
     * ]);
     */

    console.log(
      'Ver detalle de evaluación:',
      assessment,
    );
  }

  onOpenAndFinish(assessmentId: number): void {
    if (!this.studentId) {
      return;
    }

    this.stageAssessmentService
      .markFinished(
        assessmentId,
        this.studentId,
      )
      .subscribe({
        next: () => {
          this.clearHighlight();
          this.loadAssessments();
        },
        error: () => {
          this.showNotification(
            'Error al marcar como completado.',
            true,
          );
        },
      });
  }

  onContactSupport(): void {
    /*
     * Aquí puedes abrir WhatsApp, correo o navegar
     * hacia la página de soporte.
     */

    this.showNotification(
      'Comunícate con tu instructor o con soporte académico.',
    );
  }

  clearHighlight(): void {
    if (!this.highlightId) {
      return;
    }

    this.highlightId = null;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        highlight: null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  trackByAssessmentId(
    index: number,
    assessment: StageAssessment,
  ): number {
    return assessment.id;
  }

  private showNotification(
    message: string,
    isError = false,
    isSuccess = false,
  ): void {
    this.modal = {
      ...modalInitializer(),
      show: true,
      message,
      isError,
      isSuccess,
      isInfo: !isError && !isSuccess,
      close: () => {
        this.modal.show = false;
      },
    };

    setTimeout(() => {
      this.modal.show = false;
    }, 2500);
  }
}