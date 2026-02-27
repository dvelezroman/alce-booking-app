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
import { ActivatedRoute, Router } from '@angular/router';

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
  loading: boolean = true;

  pendingAssessments: StageAssessment[] = [];
  expiredAssessments: StageAssessment[] = [];
  completedAssessments: StageAssessment[] = [];

  activeCount: number = 0;
  expiredCount: number = 0;

  hasPending: boolean = false;
  hasExpired: boolean = false;

  highlightId: number | null = null;

  modal: ModalDto = modalInitializer();

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private stageAssessmentService: StageAssessmentService,
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.highlightId = params['highlight']
        ? +params['highlight']
        : null;
    });

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

  private loadAssessments() {
    if (!this.studentId) return;

    this.loading = true;

    this.stageAssessmentService
      .getAll({ studentId: this.studentId })
      .subscribe({
        next: (list) => {

          const sorted = (list ?? []).sort(
            (a, b) =>
              new Date(b.dueDate).getTime() -
              new Date(a.dueDate).getTime()
          );

          // Clasificación por statusForStudent
          this.pendingAssessments =
            sorted.filter(a => a.statusForStudent === 'active');

          this.expiredAssessments =
            sorted.filter(a => a.statusForStudent === 'agedOut');

          this.completedAssessments =
            sorted.filter(a => a.statusForStudent === 'completed');

          this.activeCount = this.pendingAssessments.length;
          this.expiredCount = this.expiredAssessments.length;

          this.hasPending = this.activeCount > 0;
          this.hasExpired = this.expiredCount > 0;

          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.showNotification("Error al obtener evaluaciones.", true);
        }
      });
  }

  onOpenAndFinish(assessmentId: number) {
    if (!this.studentId) return;

    this.stageAssessmentService
      .markFinished(assessmentId, this.studentId)
      .subscribe({
        next: () => {
          this.loadAssessments();
        },
        error: () => {
          this.showNotification("Error al marcar como completado.", true);
        }
      });
  }

  clearHighlight(): void {
    if (!this.highlightId) return;

    this.highlightId = null;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { highlight: null },
      queryParamsHandling: 'merge'
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