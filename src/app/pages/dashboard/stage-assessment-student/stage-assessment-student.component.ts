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
  hasActiveAssessments: boolean = false;
  loading: boolean = true;

  filterType: 'active' | 'expired' | 'all' = 'all';

  allAssessments: StageAssessment[] = [];
  assessments: StageAssessment[] = [];

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

  /** cargar los assessments del backend */
  private loadAssessments() {
    this.loading = true;

    this.stageAssessmentService
      .checkActiveByStudent(this.studentId!, true)
      .subscribe({
        next: (res) => {

          const list = res.assessments ?? [];

          this.allAssessments = list.sort(
            (a, b) =>
              new Date(b.dueDate).getTime() -
              new Date(a.dueDate).getTime()
          );

          this.activeCount = this.allAssessments.filter(a => !a.isPastDue).length;
          this.expiredCount = this.allAssessments.filter(a => a.isPastDue).length;

          this.hasPending = this.activeCount > 0;
          this.hasExpired = this.expiredCount > 0;

          this.applyFilter();

          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.showNotification("Error al obtener tus evaluaciones.", true);
        }
      });
  }

  applyFilter() {

    switch (this.filterType) {

      case 'active':
        this.assessments =
          this.allAssessments.filter(a => !a.isPastDue);
        break;

      case 'expired':
        this.assessments =
          this.allAssessments.filter(a => a.isPastDue);
        break;

      case 'all':
        this.assessments = [...this.allAssessments];
        break;
    }
  }

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