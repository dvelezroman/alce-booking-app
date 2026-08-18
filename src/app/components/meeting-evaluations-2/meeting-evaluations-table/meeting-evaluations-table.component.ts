import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

import {
  InstructorEvaluation,
} from '../../../services/dtos/instructor-evaluation.dto';

@Component({
  selector: 'app-meeting-evaluations-table',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './meeting-evaluations-table.component.html',
  styleUrl: './meeting-evaluations-table.component.scss',
})
export class MeetingEvaluationsTableComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() evaluations: InstructorEvaluation[] = [];
  @Input() isLoading = false;
  @Input() showInstructorColumn = true;
  @Input() showStudentColumn = true;
  @Input() updatingEvaluationId: number | null = null;

  /* =========================
     OUTPUTS
  ========================= */

  @Output() evaluationSelected =
    new EventEmitter<InstructorEvaluation>();

  @Output() acceptanceToggled =
    new EventEmitter<{
      id: number;
      accepted: boolean;
    }>();

  /* =========================
     MENU
  ========================= */

  openMenuId: number | null = null;

  toggleMenu(
    event: MouseEvent,
    evaluation: InstructorEvaluation,
  ): void {
    event.stopPropagation();

    if (evaluation.id === undefined) {
      return;
    }

    this.openMenuId =
      this.openMenuId === evaluation.id
        ? null
        : evaluation.id;
  }

  isMenuOpen(
    evaluation: InstructorEvaluation,
  ): boolean {
    return (
      evaluation.id !== undefined &&
      this.openMenuId === evaluation.id
    );
  }

  closeMenu(): void {
    this.openMenuId = null;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeMenu();
  }

  /* =========================
     ACTIONS
  ========================= */

  onView(
    event: MouseEvent,
    evaluation: InstructorEvaluation,
  ): void {
    event.stopPropagation();

    this.closeMenu();

    this.evaluationSelected.emit(
      evaluation,
    );
  }

  onToggleAcceptance(
    event: MouseEvent,
    evaluation: InstructorEvaluation,
  ): void {
    event.stopPropagation();

    if (
      evaluation.id === undefined ||
      this.updatingEvaluationId === evaluation.id
    ) {
      return;
    }

    this.closeMenu();

    this.acceptanceToggled.emit({
      id: evaluation.id,
      accepted: !evaluation.accepted,
    });
  }

  /* =========================
     STUDENT
  ========================= */

  getStudentName(
    evaluation: InstructorEvaluation,
  ): string {
    const value = evaluation as any;

    const firstName =
      value.student?.user?.firstName ||
      value.student?.firstName ||
      value.studentFirstName ||
      '';

    const lastName =
      value.student?.user?.lastName ||
      value.student?.lastName ||
      value.studentLastName ||
      '';

    const name =
      [firstName, lastName]
        .filter(Boolean)
        .join(' ')
        .trim();

    return (
      name ||
      value.studentName ||
      'Sin estudiante'
    );
  }

  getStudentEmail(
    evaluation: InstructorEvaluation,
  ): string {
    const value = evaluation as any;

    return (
      value.student?.user?.emailAddress ||
      value.student?.user?.email ||
      value.student?.emailAddress ||
      value.student?.email ||
      value.studentEmail ||
      ''
    );
  }

  getStudentInitials(
    evaluation: InstructorEvaluation,
  ): string {
    return this.getInitials(
      this.getStudentName(evaluation),
    );
  }

  /* =========================
     INSTRUCTOR
  ========================= */

  getInstructorName(
    evaluation: InstructorEvaluation,
  ): string {
    const value = evaluation as any;

    const firstName =
      value.instructor?.user?.firstName ||
      value.instructor?.firstName ||
      value.instructorFirstName ||
      '';

    const lastName =
      value.instructor?.user?.lastName ||
      value.instructor?.lastName ||
      value.instructorLastName ||
      '';

    const name =
      [firstName, lastName]
        .filter(Boolean)
        .join(' ')
        .trim();

    return (
      name ||
      value.instructorName ||
      'Sin instructor'
    );
  }

  getInstructorEmail(
    evaluation: InstructorEvaluation,
  ): string {
    const value = evaluation as any;

    return (
      value.instructor?.user?.emailAddress ||
      value.instructor?.user?.email ||
      value.instructor?.emailAddress ||
      value.instructor?.email ||
      value.instructorEmail ||
      ''
    );
  }

  /* =========================
     MEETING / CLASS
  ========================= */

  getClassTitle(
    evaluation: InstructorEvaluation,
  ): string {
    const value = evaluation as any;

    const stage =
      value.meeting?.stage?.stageNumber ??
      value.meeting?.stage?.number ??
      value.stage?.stageNumber ??
      value.stage?.number ??
      value.stageNumber;

    const unit =
      value.meeting?.unit ??
      value.meeting?.meetingTheme?.unit ??
      value.unit;

    if (stage && unit) {
      return `STG ${stage} - Unit ${unit}`;
    }

    if (stage) {
      return `STG ${stage}`;
    }

    return (
      value.meeting?.title ||
      value.meetingTitle ||
      value.className ||
      'Clase'
    );
  }

  getClassDescription(
    evaluation: InstructorEvaluation,
  ): string {
    const value = evaluation as any;

    return (
      value.meeting?.meetingTheme?.description ||
      value.meeting?.theme?.description ||
      value.meeting?.description ||
      value.classDescription ||
      value.topic ||
      ''
    );
  }

  /* =========================
     RATING
  ========================= */

  getRating(
    evaluation: InstructorEvaluation,
  ): number {
    const value = evaluation as any;

    return Number(
      value.rating ??
      value.score ??
      value.points ??
      0
    );
  }

  /* =========================
     OBSERVATION
  ========================= */

  getObservation(
    evaluation: InstructorEvaluation,
  ): string {
    const value = evaluation as any;

    return (
      value.observation ||
      value.observations ||
      value.comment ||
      'Sin observación'
    );
  }

  /* =========================
     DATE
  ========================= */

  getEvaluationDate(
    evaluation: InstructorEvaluation,
  ): string | Date | null {
    const value = evaluation as any;

    return (
      value.meeting?.date ||
      value.date ||
      value.createdAt ||
      null
    );
  }

  getEvaluationHour(
    evaluation: InstructorEvaluation,
  ): string | number | null {
    const value = evaluation as any;

    return (
      value.meeting?.localhour ??
      value.meeting?.hour ??
      value.localhour ??
      value.hour ??
      null
    );
  }

  formatDate(
    value: string | Date | null,
  ): string {
    if (!value) {
      return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
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

  formatHour(
    hour: string | number | null,
    dateValue?: string | Date | null,
  ): string {
    if (
      hour !== null &&
      hour !== undefined &&
      hour !== ''
    ) {
      const numericHour =
        Number(hour);

      if (
        Number.isFinite(numericHour) &&
        numericHour >= 0 &&
        numericHour <= 23
      ) {
        const period =
          numericHour >= 12
            ? 'p. m.'
            : 'a. m.';

        const normalizedHour =
          numericHour % 12 || 12;

        return `${String(normalizedHour).padStart(2, '0')}:00 ${period}`;
      }

      return String(hour);
    }

    if (dateValue) {
      const date =
        new Date(dateValue);

      if (!Number.isNaN(date.getTime())) {
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

    return '—';
  }

  /* =========================
     HELPERS
  ========================= */

  private getInitials(
    name: string,
  ): string {
    const parts =
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (!parts.length) {
      return 'ES';
    }

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  }

  trackByEvaluationId(
    index: number,
    evaluation: InstructorEvaluation,
  ): number {
    return evaluation.id ?? index;
  }

  hasObservation(
    evaluation: InstructorEvaluation,
  ): boolean {
    const value =
      evaluation as InstructorEvaluation & {
        observation?: string | null;
        observations?: string | null;
        comment?: string | null;
        notes?: string | null;
      };

    return !!(
      value.observation?.trim() ||
      value.observations?.trim() ||
      value.comment?.trim() ||
      value.notes?.trim()
    );
  }
}