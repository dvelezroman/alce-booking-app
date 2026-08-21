import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  StageAssessment,
} from '../../../services/dtos/stage-assessment.dto';

@Component({
  selector: 'app-stage-assessment-list-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './stage-assessment-list-table.component.html',
  styleUrl: './stage-assessment-list-table.component.scss',
})
export class StageAssessmentListTableComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() assessments: StageAssessment[] = [];


  /* =========================
     OUTPUTS
  ========================= */

  @Output() assignedRequested =
    new EventEmitter<StageAssessment>();

  @Output() finishedRequested =
    new EventEmitter<StageAssessment>();

  @Output() deleteRequested =
    new EventEmitter<StageAssessment>();


  /* =========================
     SEARCH
  ========================= */

  searchTerm = '';

  get filteredAssessments(): StageAssessment[] {
    const term =
      this.searchTerm
        .trim()
        .toLowerCase();

    if (!term) {
      return this.assessments;
    }

    return this.assessments.filter(
      assessment => {
        const values = [
          this.getResourceName(assessment),
          this.getStageLabel(assessment),
          this.getCreatorName(assessment),
          this.getStatusLabel(assessment),
          String(assessment.id),
          String(this.getAssignedCount(assessment)),
          String(this.getFinishedCount(assessment)),
        ]
          .join(' ')
          .toLowerCase();

        return values.includes(term);
      },
    );
  }


  /* =========================
     MENU
  ========================= */

  openedMenuId: number | null = null;

  toggleMenu(
    assessmentId: number,
    event: MouseEvent,
  ): void {
    event.stopPropagation();

    this.openedMenuId =
      this.openedMenuId === assessmentId
        ? null
        : assessmentId;
  }

  isMenuOpen(
    assessmentId: number,
  ): boolean {
    return this.openedMenuId === assessmentId;
  }

  closeMenu(): void {
    this.openedMenuId = null;
  }

  shouldOpenMenuUp(
    assessment: StageAssessment,
  ): boolean {
    const total =
      this.filteredAssessments.length;

    if (total <= 2) {
      return false;
    }

    const index =
      this.filteredAssessments.findIndex(
        item => item.id === assessment.id,
      );

    return index >= total - 2;
  }


  /* =========================
     EVENTS
  ========================= */

  onAssigned(
    assessment: StageAssessment,
  ): void {
    this.closeMenu();
    this.assignedRequested.emit(assessment);
  }

  onFinished(
    assessment: StageAssessment,
  ): void {
    this.closeMenu();
    this.finishedRequested.emit(assessment);
  }

  onDelete(
    assessment: StageAssessment,
  ): void {
    this.closeMenu();
    this.deleteRequested.emit(assessment);
  }


  /* =========================
     RESOURCE
  ========================= */

  getResourceName(
    assessment: StageAssessment,
  ): string {
    return (
      assessment.stageAssessmentResource
        ?.description ||
      `Evaluación #${assessment.id}`
    );
  }


  /* =========================
     STAGE
  ========================= */

  getStageLabel(
    assessment: StageAssessment,
  ): string {
    const stage =
      assessment.stage;

    if (!stage) {
      return `Stage ${assessment.stageId}`;
    }

    return (
      stage.description ||
      stage.number ||
      `Stage ${assessment.stageId}`
    );
  }


  /* =========================
     COUNTS
  ========================= */

  getAssignedCount(
    assessment: StageAssessment,
  ): number {
    return (
      assessment.studentIds?.length ||
      assessment.students?.length ||
      0
    );
  }

  getFinishedCount(
    assessment: StageAssessment,
  ): number {
    return assessment.finished?.length || 0;
  }

  getFinishedPercentage(
    assessment: StageAssessment,
  ): number {
    const assigned =
      this.getAssignedCount(assessment);

    if (!assigned) {
      return 0;
    }

    return Math.round(
      (
        this.getFinishedCount(assessment) /
        assigned
      ) * 100,
    );
  }


  /* =========================
     CREATOR
  ========================= */

  getCreatorName(
    assessment: StageAssessment,
  ): string {
    const creator =
      assessment.creator;

    if (!creator) {
      return 'Sin información';
    }

    const name =
      `${creator.firstName || ''} ${creator.lastName || ''}`
        .trim();

    return (
      name ||
      creator.email ||
      'Sin información'
    );
  }

  getCreatorInitials(
    assessment: StageAssessment,
  ): string {
    const creator =
      assessment.creator;

    if (!creator) {
      return '—';
    }

    return (
      `${creator.firstName?.charAt(0) || ''}${creator.lastName?.charAt(0) || ''}`
        .toUpperCase() ||
      '—'
    );
  }


  /* =========================
     DATE
  ========================= */

  formatDate(
    value?: string | null,
  ): string {
    if (!value) {
      return '—';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return '—';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
    ).format(date);
  }

  getDaysUntilDue(
    assessment: StageAssessment,
  ): number | null {
    if (!assessment.dueDate) {
      return null;
    }

    const due =
      new Date(assessment.dueDate);

    if (
      Number.isNaN(
        due.getTime(),
      )
    ) {
      return null;
    }

    const today =
      new Date();

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    return Math.ceil(
      (
        due.getTime() -
        today.getTime()
      ) /
      86400000,
    );
  }


  /* =========================
     STATUS
  ========================= */

  getStatus(
    assessment: StageAssessment,
  ): 'active' | 'warning' | 'expired' | 'finished' {

    const assigned =
      this.getAssignedCount(assessment);

    const finished =
      this.getFinishedCount(assessment);

    if (
      assigned > 0 &&
      finished >= assigned
    ) {
      return 'finished';
    }

    if (assessment.isPastDue) {
      return 'expired';
    }

    const days =
      this.getDaysUntilDue(assessment);

    if (
      days !== null &&
      days >= 0 &&
      days <= 3
    ) {
      return 'warning';
    }

    return 'active';
  }

  getStatusLabel(
    assessment: StageAssessment,
  ): string {
    switch (
      this.getStatus(assessment)
    ) {
      case 'finished':
        return 'Finalizada';

      case 'expired':
        return 'Vencida';

      case 'warning':
        return 'Por vencer';

      default:
        return 'Activa';
    }
  }


  /* =========================
     DUE DATE LABEL
  ========================= */

  getDueDateLabel(
    assessment: StageAssessment,
  ): string {

    const status =
      this.getStatus(assessment);

    if (status === 'finished') {
      return 'Completada';
    }

    if (status === 'expired') {
      return 'Vencida';
    }

    const days =
      this.getDaysUntilDue(assessment);

    if (days === null) {
      return '';
    }

    if (days === 0) {
      return 'Vence hoy';
    }

    if (days === 1) {
      return 'En 1 día';
    }

    if (days > 1) {
      return `En ${days} días`;
    }

    return 'Vencida';
  }
}