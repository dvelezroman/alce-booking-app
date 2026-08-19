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
  PlatformAssessmentAssignment,
} from '../../../services/dtos/platform-assessment.dto';

@Component({
  selector: 'app-assessment-reports-platform-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './assessment-reports-platform-table.component.html',
  styleUrl: './assessment-reports-platform-table.component.scss',
})
export class AssessmentReportsPlatformTableComponent {

  @Input() assessments: PlatformAssessmentAssignment[] = [];
  @Input() applyingPlatformId: number | null = null;
  @Input() applyPointsOverride: number | null = null;

  @Output() applyRequested =
    new EventEmitter<PlatformAssessmentAssignment>();

  @Output() cancelRequested =
    new EventEmitter<void>();

  @Output() confirmRequested =
    new EventEmitter<PlatformAssessmentAssignment>();

  @Output() pointsOverrideChange =
    new EventEmitter<number | null>();

  openActionsId: number | null = null;
  menuTop = 0;
  menuLeft = 0;

  isApplying(
    assessment: PlatformAssessmentAssignment,
  ): boolean {
    return (
      this.applyingPlatformId ===
      assessment.id
    );
  }

  toggleActionsMenu(
    event: MouseEvent,
    assessment: PlatformAssessmentAssignment,
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

    const menuWidth = 190;
    const menuHeight =
      this.isApplying(assessment)
        ? 112
        : 58;

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
    assessment: PlatformAssessmentAssignment,
  ): boolean {
    return (
      this.openActionsId ===
      assessment.id
    );
  }

  @HostListener(
    'document:click'
  )
  onDocumentClick(): void {
    this.closeActionsMenu();
  }

  @HostListener(
    'window:resize'
  )
  onWindowResize(): void {
    this.closeActionsMenu();
  }

  @HostListener(
    'window:scroll'
  )
  onWindowScroll(): void {
    this.closeActionsMenu();
  }

  onApply(
    assessment: PlatformAssessmentAssignment,
  ): void {
    this.closeActionsMenu();

    this.applyRequested.emit(
      assessment,
    );
  }

  onCancel(): void {
    this.closeActionsMenu();

    this.cancelRequested.emit();
  }

  onConfirm(
    assessment: PlatformAssessmentAssignment,
  ): void {
    this.closeActionsMenu();

    this.confirmRequested.emit(
      assessment,
    );
  }

  onPointsChange(
    value: number | null,
  ): void {
    const points =
      value === null ||
      value === undefined ||
      value === ('' as any)
        ? null
        : Number(value);

    this.pointsOverrideChange.emit(
      points,
    );
  }

  getTitle(
    assessment: PlatformAssessmentAssignment,
  ): string {
    const value =
      assessment as PlatformAssessmentAssignment & {
        title?: string;
        assessmentTitle?: string;
        name?: string;
      };

    return (
      value.title ??
      value.assessmentTitle ??
      value.name ??
      'Evaluación de plataforma'
    );
  }

  getType(
    assessment: PlatformAssessmentAssignment,
  ): string {
    const value =
      assessment as PlatformAssessmentAssignment & {
        type?: string;
        assessmentType?: string;
      };

    const type =
      String(
        value.type ??
        value.assessmentType ??
        '',
      )
        .trim()
        .toUpperCase();

    switch (type) {
      case 'TYPE_1':
      case 'SPEAKING':
        return 'Speaking';

      case 'TYPE_2':
      case 'GRAMMAR':
        return 'Grammar';

      case 'TYPE_3':
      case 'WRITING':
        return 'Writing';

      default:
        return (
          type ||
          'S2S'
        );
    }
  }

  getTypeClass(
    assessment: PlatformAssessmentAssignment,
  ): string {
    const type =
      this.getType(
        assessment,
      )
        .toLowerCase();

    if (
      type.includes('speaking')
    ) {
      return 'platform-type--purple';
    }

    if (
      type.includes('grammar')
    ) {
      return 'platform-type--blue';
    }

    if (
      type.includes('writing')
    ) {
      return 'platform-type--orange';
    }

    return 'platform-type--gray';
  }

  getStage(
    assessment: PlatformAssessmentAssignment,
  ): string {
    const value =
      assessment as PlatformAssessmentAssignment & {
        stage?: string | number;
        stageId?: number;
        stageNumber?: string | number;
        studentStage?: string | number;
      };

    const stage =
      value.stageNumber ??
      value.studentStage ??
      value.stage ??
      value.stageId;

    return stage != null
      ? String(stage)
      : '—';
  }

  getPoints(
    assessment: PlatformAssessmentAssignment,
  ): number | null {
    return (
      assessment.points ??
      null
    );
  }

  getWritingPoints(
    assessment: PlatformAssessmentAssignment,
  ): number | null {
    return (
      assessment.writingPoints ??
      null
    );
  }

  getStatus(
    assessment: PlatformAssessmentAssignment,
  ): string {
    const status =
      String(
        assessment.status ?? '',
      )
        .trim()
        .toLowerCase();

    switch (status) {
      case 'completed':
        return 'Completada';

      case 'pending':
        return 'Pendiente';

      case 'processing':
        return 'Procesando';

      case 'failed':
        return 'Fallida';

      default:
        return (
          status ||
          'Sin estado'
        );
    }
  }

  getStatusClass(
    assessment: PlatformAssessmentAssignment,
  ): string {
    const status =
      String(
        assessment.status ?? '',
      )
        .trim()
        .toLowerCase();

    switch (status) {
      case 'completed':
        return 'platform-status--completed';

      case 'processing':
        return 'platform-status--processing';

      case 'failed':
        return 'platform-status--failed';

      default:
        return 'platform-status--pending';
    }
  }

  getWritingStatus(
    assessment: PlatformAssessmentAssignment,
  ): string {
    return assessment.writingApplied
      ? 'Aplicado'
      : 'Sin aplicar';
  }

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

  getCreatedAt(
    assessment: PlatformAssessmentAssignment,
  ): string | Date | undefined {
    const value =
      assessment as PlatformAssessmentAssignment & {
        createdAt?: string | Date;
        completedAt?: string | Date;
        updatedAt?: string | Date;
      };

    return (
      value.completedAt ??
      value.createdAt ??
      value.updatedAt
    );
  }
}