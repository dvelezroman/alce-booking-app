import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { filter, take } from 'rxjs';

import { UserDto } from '../../../services/dtos/user.dto';
import { selectUserData } from '../../../store/user.selector';

import { ModalComponent } from '../../../components/modal/modal.component';
import {
  ModalDto,
  modalInitializer,
} from '../../../components/modal/modal.dto';

import {
  PlatformAssessmentAssignment,
} from '../../../services/dtos/platform-assessment.dto';

import {
  PlatformAssessmentService,
} from '../../../services/platform-assessment.service';

/* COMPONENTES PLATFORM ASSESSMENT */
import {
  PlatformAssessmentCardComponent,
} from '../../../components/platform-assessment/platform-assessment-card/platform-assessment-card.component';

import {
  PlatformAssessmentHeaderComponent,
} from '../../../components/platform-assessment/platform-assessment-header/platform-assessment-header.component';

import {
  PlatformAssessmentSummaryComponent,
} from '../../../components/platform-assessment/platform-assessment-summary/platform-assessment-summary.component';

import {
  PlatformAssessmentTabsComponent,
} from '../../../components/platform-assessment/platform-assessment-tabs/platform-assessment-tabs.component';

import {
  PlatformAssessmentListComponent,
} from '../../../components/platform-assessment/platform-assessment-list/platform-assessment-list.component';

import {
  PlatformAssessmentEmptyStateComponent,
} from '../../../components/platform-assessment/platform-assessment-empty-state/platform-assessment-empty-state.component';

export type PlatformAssessmentTab =
  | 'pending'
  | 'expired'
  | 'completed';

@Component({
  selector: 'app-platform-assessments-student',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,

    PlatformAssessmentCardComponent,
    PlatformAssessmentHeaderComponent,
    PlatformAssessmentSummaryComponent,
    PlatformAssessmentTabsComponent,
    PlatformAssessmentListComponent,
    PlatformAssessmentEmptyStateComponent,
  ],
  templateUrl:
    './platform-assessments-student.component.html',
  styleUrls: [
    './platform-assessments-student.component.scss',
  ],
})
export class PlatformAssessmentsStudentComponent
  implements OnInit, OnDestroy
{
  studentId: number | null = null;

  loading = true;

  private notificationTimer: ReturnType<typeof setTimeout> | null =
    null;

  /* ================================
     ASSESSMENTS
  ================================ */

  pendingAssessments:
    PlatformAssessmentAssignment[] = [];

  expiredAssessments:
    PlatformAssessmentAssignment[] = [];

  completedAssessments:
    PlatformAssessmentAssignment[] = [];

  /* ================================
     CONTADORES
  ================================ */

  activeCount = 0;

  expiredCount = 0;

  completedCount = 0;

  totalCount = 0;

  /* ================================
     ESTADOS
  ================================ */

  hasPending = false;

  hasExpired = false;

  hasCompleted = false;

  /* ================================
     TAB ACTIVO
  ================================ */

  selectedTab:
    PlatformAssessmentTab = 'pending';

  /* ================================
     MODAL
  ================================ */

  modal: ModalDto =
    modalInitializer();

  constructor(
    private readonly store: Store,
    private readonly platformAssessmentService:
      PlatformAssessmentService,
  ) {}

  /* ================================
     INIT
  ================================ */

  ngOnInit(): void {
    this.store
      .select(selectUserData)
      .pipe(
        filter(
          (user): user is UserDto =>
            !!user
        ),
        take(1),
      )
      .subscribe((user) => {
        this.studentId =
          user.student?.id ?? null;

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

  /* ================================
     CARGAR ASSESSMENTS
  ================================ */

  private loadAssessments(): void {
    if (!this.studentId) {
      return;
    }

    this.loading = true;

    this.platformAssessmentService
      .syncFromRemote(this.studentId)
      .subscribe({
        next: (
          list:
            PlatformAssessmentAssignment[]
        ) => {
          const items =
            list ?? [];

          this.pendingAssessments =
            items.filter(
              (assessment) =>
                assessment.status ===
                'pending'
            );

          this.expiredAssessments =
            items.filter(
              (assessment) =>
                assessment.status ===
                'expired'
            );

          this.completedAssessments =
            items.filter(
              (assessment) =>
                assessment.status ===
                  'completed' ||
                assessment.status ===
                  'focus_guard'
            );

          this.updateAssessmentCounters();

          this.loading = false;
        },

        error: (error) => {
          console.error(
            'Error al sincronizar assessments de plataforma:',
            error
          );

          this.pendingAssessments = [];
          this.expiredAssessments = [];
          this.completedAssessments = [];
          this.updateAssessmentCounters();
          this.loading = false;

          this.showNotification(
            'No disponible por el momento. Intente más tarde.',
            true,
          );
        },
      });
  }

  /* ================================
     CONTADORES
  ================================ */

  private updateAssessmentCounters(): void {
    this.activeCount =
      this.pendingAssessments.length;

    this.expiredCount =
      this.expiredAssessments.length;

    this.completedCount =
      this.completedAssessments.length;

    this.totalCount =
      this.activeCount +
      this.expiredCount +
      this.completedCount;

    this.hasPending =
      this.activeCount > 0;

    this.hasExpired =
      this.expiredCount > 0;

    this.hasCompleted =
      this.completedCount > 0;
  }

  /* ================================
     ASSESSMENTS SEGÚN TAB
  ================================ */

  get selectedAssessments():
    PlatformAssessmentAssignment[] {
    switch (this.selectedTab) {
      case 'expired':
        return this.expiredAssessments;

      case 'completed':
        return this.completedAssessments;

      case 'pending':
      default:
        return this.pendingAssessments;
    }
  }

  get hasSelectedAssessments(): boolean {
    return (
      this.selectedAssessments.length > 0
    );
  }

  /* ================================
     CAMBIO DE TAB
  ================================ */

  onTabChange(
    tab: PlatformAssessmentTab
  ): void {
    this.selectedTab = tab;
  }

  /* ================================
     ABRIR ASSESSMENT
  ================================ */

  onOpenAssessment(
    assessment:
      PlatformAssessmentAssignment
  ): void {
    const url =
      assessment.status === 'completed' ||
      assessment.status === 'focus_guard'
        ? assessment.resultsUrl?.trim()
        : assessment.directAccessUrl?.trim();

    if (!url) {
      this.showNotification(
        assessment.status === 'completed' ||
        assessment.status === 'focus_guard'
          ? 'Este examen no tiene resultados disponibles.'
          : 'Este examen no tiene un enlace disponible.',
        true,
      );

      return;
    }

    window.open(
      url,
      '_blank',
      'noopener,noreferrer',
    );
  }

  /* ================================
     REFRESH
  ================================ */

  onRefreshAssessments(): void {
    if (
      !this.studentId ||
      this.loading
    ) {
      return;
    }

    this.loadAssessments();
  }

  /* ================================
     SUMMARY
  ================================ */

  onSummarySelect(
    tab: PlatformAssessmentTab
  ): void {
    this.selectedTab = tab;
  }

  /* ================================
     EMPTY STATE
  ================================ */

  onEmptyStateAction(): void {
    this.selectedTab = 'pending';
  }

  /* ================================
     MODAL
  ================================ */

  private showNotification(
    message: string,
    isError = false,
    isSuccess = false,
  ): void {
    if (this.notificationTimer) {
      clearTimeout(this.notificationTimer);
      this.notificationTimer = null;
    }

    this.modal = {
      ...modalInitializer(),
      show: true,
      message,
      isError,
      isSuccess,
      isInfo:
        !isError &&
        !isSuccess,
    };

    this.notificationTimer = setTimeout(() => {
      this.modal.show = false;
      this.notificationTimer = null;
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.notificationTimer) {
      clearTimeout(this.notificationTimer);
      this.notificationTimer = null;
    }
  }
}