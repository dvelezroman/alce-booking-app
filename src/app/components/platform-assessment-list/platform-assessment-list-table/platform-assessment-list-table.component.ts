import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  RemotePlatformAssessmentItem,
} from '../../../services/dtos/platform-assessment.dto';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-platform-assessment-list-table',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
  ],
  templateUrl: './platform-assessment-list-table.component.html',
  styleUrl: './platform-assessment-list-table.component.scss',
})
export class PlatformAssessmentListTableComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  rows: RemotePlatformAssessmentItem[] = [];

  @Input()
  loading = false;

  @Input()
  total = 0;


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  openUrlRequested =
    new EventEmitter<string>();

  @Output()
  applyWritingRequested =
    new EventEmitter<RemotePlatformAssessmentItem>();


  /* =========================
     MENU
  ========================= */

  openedMenuId: string | null = null;

  menuPosition = {
    top: 0,
    left: 0,
  };


  toggleMenu(
    assignmentId: string,
    event: MouseEvent,
  ): void {
    event.stopPropagation();

    if (
      this.openedMenuId ===
      assignmentId
    ) {
      this.closeMenu();
      return;
    }

    const button =
      event.currentTarget as HTMLElement;

    const rect =
      button.getBoundingClientRect();

    /*
     * Dimensiones aproximadas
     * del menú.
     */
    const menuWidth = 245;
    const menuHeight = 210;

    const gap = 8;
    const viewportPadding = 12;


    /* =========================
       HORIZONTAL
    ========================= */

    let left =
      rect.right -
      menuWidth;

    /*
     * Evitar que salga
     * por la izquierda.
     */
    if (
      left <
      viewportPadding
    ) {
      left =
        viewportPadding;
    }

    /*
     * Evitar que salga
     * por la derecha.
     */
    const maxLeft =
      window.innerWidth -
      menuWidth -
      viewportPadding;

    if (
      left >
      maxLeft
    ) {
      left =
        maxLeft;
    }


    /* =========================
       VERTICAL
    ========================= */

    const spaceBelow =
      window.innerHeight -
      rect.bottom -
      viewportPadding;

    const spaceAbove =
      rect.top -
      viewportPadding;

    let top: number;


    /*
     * OPCIÓN 1:
     * cabe completo debajo.
     */
    if (
      spaceBelow >=
      menuHeight + gap
    ) {
      top =
        rect.bottom +
        gap;
    }

    /*
     * OPCIÓN 2:
     * no cabe debajo,
     * pero sí arriba.
     */
    else if (
      spaceAbove >=
      menuHeight + gap
    ) {
      top =
        rect.top -
        menuHeight -
        gap;
    }

    /*
     * OPCIÓN 3:
     * no cabe completamente
     * ni arriba ni abajo.
     *
     * Lo colocamos dentro
     * del viewport.
     */
    else {
      top =
        window.innerHeight -
        menuHeight -
        viewportPadding;

      if (
        top <
        viewportPadding
      ) {
        top =
          viewportPadding;
      }
    }


    this.menuPosition = {
      top,
      left,
    };

    this.openedMenuId =
      assignmentId;
  }


  isMenuOpen(
    assignmentId: string,
  ): boolean {
    return (
      this.openedMenuId ===
      assignmentId
    );
  }


  closeMenu(): void {
    this.openedMenuId = null;
  }


  /* =========================
     URL
  ========================= */

  onOpenUrl(
    url: string | null | undefined,
  ): void {
    const value =
      url?.trim();

    if (!value) {
      return;
    }

    this.closeMenu();

    this.openUrlRequested.emit(
      value,
    );
  }


  getAccessUrl(
    row: RemotePlatformAssessmentItem,
  ): string | null {
    return (
      row.directAccessUrl?.trim() ||
      row.shareUrl?.trim() ||
      null
    );
  }


  hasResultsUrl(
    row: RemotePlatformAssessmentItem,
  ): boolean {
    return !!row.resultsUrl?.trim();
  }


  hasAccessUrl(
    row: RemotePlatformAssessmentItem,
  ): boolean {
    return !!this.getAccessUrl(row);
  }


  /* =========================
     WRITING
  ========================= */

  canApplyWritingAction(
    row: RemotePlatformAssessmentItem,
  ): boolean {
    return (
      row.mirrorId != null &&
      (
        row.writingApplied === true ||
        row.points != null
      )
    );
  }


  getWritingActionLabel(
    row: RemotePlatformAssessmentItem,
  ): string {
    if (
      !this.canApplyWritingAction(row)
    ) {
      return 'Writing no disponible';
    }

    return row.writingApplied
      ? 'Corregir Writing'
      : 'Aplicar Writing';
  }


  onApplyWriting(
    row: RemotePlatformAssessmentItem,
  ): void {
    if (
      !this.canApplyWritingAction(row)
    ) {
      return;
    }

    this.closeMenu();

    this.applyWritingRequested.emit(
      row,
    );
  }


  /* =========================
     STUDENT
  ========================= */

  getStudentName(
    row: RemotePlatformAssessmentItem,
  ): string {
    const name =
      row.studentDisplayName?.trim();

    if (name) {
      return name;
    }

    const fullName =
      [
        row.studentFirstName,
        row.studentLastName,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

    return (
      fullName ||
      'Estudiante'
    );
  }


  getStudentIdentifier(
    row: RemotePlatformAssessmentItem,
  ): string {
    return (
      `ID: ${
        row.studentId ??
        row.externalStudentId ??
        '—'
      }`
    );
  }


  /* =========================
     TEMPLATE
  ========================= */

  getTemplateTitle(
    row: RemotePlatformAssessmentItem,
  ): string {
    return (
      row.templateTitle ||
      'Sin título'
    );
  }


  getTemplateCode(
    row: RemotePlatformAssessmentItem,
  ): string {
    return (
      row.templateId ||
      '—'
    );
  }


  /* =========================
     STAGE
  ========================= */

  getStageLabel(
    row: RemotePlatformAssessmentItem,
  ): string {
    return (
      row.studentStageSnapshot != null
        ? `Stage ${row.studentStageSnapshot}`
        : '—'
    );
  }


  /* =========================
     STATUS
  ========================= */

  getStatusClass(
    status: string | null | undefined,
  ): string {
    switch (
      status?.toUpperCase()
    ) {
      case 'ACTIVE':
        return 'active';

      case 'COMPLETED':
        return 'completed';

      case 'EXPIRED':
        return 'expired';

      case 'REVOKED':
        return 'revoked';

      default:
        return 'created';
    }
  }


  getStatusLabel(
    status: string | null | undefined,
  ): string {
    return (
      status?.toUpperCase() ||
      'CREATED'
    );
  }


  /* =========================
     OUTCOME
  ========================= */

  getOutcomeClass(
    outcome: string | null | undefined,
  ): string {
    return (
      outcome === 'PASSED'
        ? 'passed'
        : 'failed'
    );
  }


  getOutcomeLabel(
    outcome: string | null | undefined,
  ): string {
    return (
      outcome ||
      '—'
    );
  }


  /* =========================
     ATTEMPTS
  ========================= */

  getAttemptsLabel(
    row: RemotePlatformAssessmentItem,
  ): string {
    return (
      `${row.attemptCount ?? 0} / ${row.maxAttempts ?? 0}`
    );
  }


  /* =========================
     POINTS
  ========================= */

  getPointsLabel(
    row: RemotePlatformAssessmentItem,
  ): string | number {
    return (
      row.points ??
      '—'
    );
  }


  /* =========================
     DATE
  ========================= */

  formatDate(
    value: string | null | undefined,
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


  formatTime(
    value: string | null | undefined,
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
        hour12: false,
      },
    ).format(date);
  }
}