import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AssessementI,
  AssessmentType,
} from '../../../services/dtos/assessment.dto';

@Component({
  selector: 'app-assessment-reports-instructor-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './assessment-reports-instructor-table.component.html',
  styleUrl: './assessment-reports-instructor-table.component.scss',
})
export class AssessmentReportsInstructorTableComponent {

  @Input() assessments: AssessementI[] = [];
  @Input() editingAssessment: AssessementI | null = null;
  @Input() editPoints: number | null = null;
  @Input() maxPointsAssessment: number | null = null;
  @Input() minPointsAssessment: number | null = null;

  @Output() viewRequested =
    new EventEmitter<AssessementI>();

  @Output() editRequested =
    new EventEmitter<AssessementI>();

  @Output() cancelEditRequested =
    new EventEmitter<void>();

  @Output() saveEditRequested =
    new EventEmitter<void>();

  @Output() editPointsChange =
    new EventEmitter<number | null>();

  @Output() deleteRequested =
    new EventEmitter<AssessementI>();


  /* =========================
     ACTION MENU
  ========================= */

  openActionsId: number | null = null;

  menuTop = 0;
  menuLeft = 0;


  toggleActionsMenu(
    event: MouseEvent,
    assessment: AssessementI,
  ): void {
    event.stopPropagation();

    if (
      this.openActionsId ===
      assessment.id
    ) {
      this.closeActionsMenu();
      return;
    }

    const button =
      event.currentTarget as HTMLElement;

    const rect =
      button.getBoundingClientRect();

    const menuWidth = 185;

    const menuHeight =
      this.isEditing(assessment)
        ? 86
        : 126;

    let left =
      rect.right -
      menuWidth;

    let top =
      rect.bottom + 6;

    if (left < 8) {
      left = 8;
    }

    if (
      left + menuWidth >
      window.innerWidth - 8
    ) {
      left =
        window.innerWidth -
        menuWidth -
        8;
    }

    if (
      top + menuHeight >
      window.innerHeight - 8
    ) {
      top =
        rect.top -
        menuHeight -
        6;
    }

    this.menuTop = top;
    this.menuLeft = left;
    this.openActionsId =
      assessment.id;
  }


  closeActionsMenu(): void {
    this.openActionsId = null;
  }


  isActionsMenuOpen(
    assessment: AssessementI,
  ): boolean {
    return (
      this.openActionsId ===
      assessment.id
    );
  }


  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeActionsMenu();
  }


  @HostListener('window:resize')
  onWindowResize(): void {
    this.closeActionsMenu();
  }


  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.closeActionsMenu();
  }


  /* =========================
     EDIT
  ========================= */

  isEditing(
    assessment: AssessementI,
  ): boolean {
    return (
      this.editingAssessment?.id ===
      assessment.id
    );
  }


  onView(
    assessment: AssessementI,
  ): void {
    this.closeActionsMenu();

    this.viewRequested.emit(
      assessment,
    );
  }


  onEdit(
    assessment: AssessementI,
  ): void {
    this.closeActionsMenu();

    this.editRequested.emit(
      assessment,
    );
  }


  onCancelEdit(): void {
    this.closeActionsMenu();

    this.cancelEditRequested.emit();
  }


  onSaveEdit(): void {
    this.closeActionsMenu();

    this.saveEditRequested.emit();
  }


  onEditPointsChange(
    value: number | null,
  ): void {
    const points =
      value === null ||
      value === undefined ||
      value === ('' as any)
        ? null
        : Number(value);

    this.editPointsChange.emit(
      points,
    );
  }


  onDelete(
    assessment: AssessementI,
  ): void {
    this.closeActionsMenu();

    this.deleteRequested.emit(
      assessment,
    );
  }


  /* =========================
     STUDENT
  ========================= */

  getStudentName(
    assessment: AssessementI,
  ): string {
    const student =
      assessment.student as any;

    const user =
      student?.user ??
      student;

    const firstName =
      user?.firstName ??
      '';

    const lastName =
      user?.lastName ??
      '';

    return (
      `${firstName} ${lastName}`.trim() ||
      'Sin estudiante'
    );
  }


  getStudentInitials(
    assessment: AssessementI,
  ): string {
    const name =
      this.getStudentName(
        assessment,
      )
        .trim()
        .split(/\s+/);

    if (!name.length) {
      return 'ES';
    }

    if (name.length === 1) {
      return name[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      name[0].charAt(0) +
      name[1].charAt(0)
    ).toUpperCase();
  }


  getStudentId(
    assessment: AssessementI,
  ): string {
    return String(
      assessment.student?.id ??
      '—',
    );
  }


  /* =========================
     INSTRUCTOR
  ========================= */

  getInstructorName(
    assessment: AssessementI,
  ): string {
    const user =
      assessment.instructor?.user;

    if (!user) {
      return 'Sin instructor';
    }

    return (
      `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
      'Sin instructor'
    );
  }


  getInstructorInitials(
    assessment: AssessementI,
  ): string {
    const name =
      this.getInstructorName(
        assessment,
      )
        .trim()
        .split(/\s+/);

    if (!name.length) {
      return 'IN';
    }

    if (name.length === 1) {
      return name[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      name[0].charAt(0) +
      name[1].charAt(0)
    ).toUpperCase();
  }


  /* =========================
     STAGE
  ========================= */

  getStage(
    assessment: AssessementI,
  ): string {
    const stageId =
      assessment.stageId;

    return stageId != null
      ? String(stageId)
      : '—';
  }


  /* =========================
     TYPE
  ========================= */

  getAssessmentType(
    assessment: AssessementI,
  ): string {
    switch (assessment.type) {
      case AssessmentType.Speaking:
        return 'Speaking';

      case AssessmentType.Grammar:
        return 'Grammar';

      default:
        return (
          assessment.type ||
          'Sin tipo'
        );
    }
  }


  getTypeClass(
    assessment: AssessementI,
  ): string {
    switch (assessment.type) {
      case AssessmentType.Speaking:
        return 'assessment-type--purple';

      case AssessmentType.Grammar:
        return 'assessment-type--blue';

      default:
        return 'assessment-type--gray';
    }
  }


  /* =========================
     SCORE
  ========================= */

  getPoints(
    assessment: AssessementI,
  ): number {
    return Number(
      assessment.points ?? 0,
    );
  }


  getScorePercentage(
    assessment: AssessementI,
  ): number {
    const maximum =
      this.maxPointsAssessment ??
      100;

    if (!maximum) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        Number(
          (
            (
              this.getPoints(
                assessment,
              ) /
              maximum
            ) *
            100
          ).toFixed(1),
        ),
      ),
    );
  }


  isPassed(
    assessment: AssessementI,
  ): boolean {
    const minimum =
      this.minPointsAssessment ??
      0;

    return (
      this.getPoints(
        assessment,
      ) >= minimum
    );
  }


  getStatusLabel(
    assessment: AssessementI,
  ): string {
    return this.isPassed(
      assessment,
    )
      ? 'Aprobada'
      : 'No aprobada';
  }


  /* =========================
     NOTE
  ========================= */

  getNote(
    assessment: AssessementI,
  ): string {
    if (
      assessment.note == null
    ) {
      return 'Sin comentario';
    }

    if (
      typeof assessment.note ===
      'string'
    ) {
      return (
        assessment.note.trim() ||
        'Sin comentario'
      );
    }

    const value =
      assessment.note as Record<
        string,
        unknown
      >;

    return String(
      value['comment'] ??
      value['observation'] ??
      value['description'] ??
      'Sin comentario',
    );
  }


  /* =========================
     DATE
  ========================= */

  formatDate(
    value?: string | Date,
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
      return String(value);
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


  formatTime(
    value?: string | Date,
  ): string {
    if (!value) {
      return '';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return '';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
    ).format(date);
  }
}