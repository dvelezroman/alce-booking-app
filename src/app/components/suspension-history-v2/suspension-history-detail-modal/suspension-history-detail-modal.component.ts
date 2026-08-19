import {
  CommonModule,
} from '@angular/common';

import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

import {
  StudentSuspensionHistory,
} from '../../../services/dtos/student.dto';

@Component({
  selector: 'app-suspension-history-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './suspension-history-detail-modal.component.html',
  styleUrl: './suspension-history-detail-modal.component.scss',
})
export class SuspensionHistoryDetailModalComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() show = false;

  @Input() item:
    StudentSuspensionHistory | null = null;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() close =
    new EventEmitter<void>();


  /* =========================
     CLOSE
  ========================= */

  onClose(): void {
    this.close.emit();
  }


  onBackdropClick(): void {
    this.onClose();
  }


  onPanelClick(
    event: MouseEvent,
  ): void {
    event.stopPropagation();
  }


  @HostListener(
    'document:keydown.escape',
  )
  onEscape(): void {
    if (this.show) {
      this.onClose();
    }
  }


  /* =========================
     STUDENT
  ========================= */

  get studentName(): string {
    if (!this.item) {
      return 'Sin estudiante';
    }

    const value =
      this.item as StudentSuspensionHistory & {
        studentName?: string;
        student_name?: string;
        student?: {
          firstName?: string;
          lastName?: string;
          user?: {
            firstName?: string;
            lastName?: string;
          };
        };
      };

    if (value.studentName) {
      return value.studentName;
    }

    if (value.student_name) {
      return value.student_name;
    }

    const firstName =
      value.student?.user?.firstName ??
      value.student?.firstName ??
      '';

    const lastName =
      value.student?.user?.lastName ??
      value.student?.lastName ??
      '';

    return (
      `${firstName} ${lastName}`.trim() ||
      'Sin estudiante'
    );
  }


  get studentInitials(): string {
    const parts =
      this.studentName
        .trim()
        .split(/\s+/);

    if (!parts.length) {
      return 'ES';
    }

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[1].charAt(0)
    ).toUpperCase();
  }


  get studentId(): string {
    if (!this.item) {
      return '—';
    }

    const value =
      this.item as StudentSuspensionHistory & {
        studentId?: number;
        student_id?: number;
        student?: {
          id?: number;
        };
      };

    return String(
      value.studentId ??
      value.student_id ??
      value.student?.id ??
      '—',
    );
  }


  get studentEmail(): string {
    if (!this.item) {
      return 'Sin correo';
    }

    const value =
      this.item as StudentSuspensionHistory & {
        email?: string;
        student?: {
          email?: string;
          user?: {
            email?: string;
            emailAddress?: string;
          };
        };
      };

    return (
      value.student?.user?.emailAddress ??
      value.student?.user?.email ??
      value.student?.email ??
      value.email ??
      'Sin correo'
    );
  }


  /* =========================
     STAGE
  ========================= */

  get stageLabel(): string {
    if (!this.item) {
      return '—';
    }

    const value =
      this.item as StudentSuspensionHistory & {
        stageId?: number;
        stage_id?: number;
        stage?: {
          id?: number;
          number?: string | number;
          stageNumber?: string | number;
          description?: string;
        };
        student?: {
          stage?: {
            id?: number;
            number?: string | number;
            stageNumber?: string | number;
            description?: string;
          };
        };
      };

    const stage =
      value.stage?.stageNumber ??
      value.stage?.number ??
      value.student?.stage?.stageNumber ??
      value.student?.stage?.number ??
      value.stageId ??
      value.stage_id;

    return stage != null
      ? `STG ${stage}`
      : '—';
  }


  get stageDescription(): string {
    if (!this.item) {
      return 'Sin descripción';
    }

    const value =
      this.item as StudentSuspensionHistory & {
        stage?: {
          description?: string;
        };
        student?: {
          stage?: {
            description?: string;
          };
        };
      };

    return (
      value.stage?.description ??
      value.student?.stage?.description ??
      'Sin descripción'
    );
  }


  /* =========================
     DATES
  ========================= */

  get startDate(): string {
    if (!this.item) {
      return '';
    }

    const value =
      this.item as StudentSuspensionHistory & {
        startDate?: string;
        start_date?: string;
        suspensionStartDate?: string;
        from?: string;
      };

    return (
      value.startDate ??
      value.start_date ??
      value.suspensionStartDate ??
      value.from ??
      ''
    );
  }


  get endDate(): string {
    if (!this.item) {
      return '';
    }

    const value =
      this.item as StudentSuspensionHistory & {
        endDate?: string;
        end_date?: string;
        suspensionEndDate?: string;
        to?: string;
      };

    return (
      value.endDate ??
      value.end_date ??
      value.suspensionEndDate ??
      value.to ??
      ''
    );
  }


  get days(): number {
    if (!this.item) {
      return 0;
    }

    const value =
      this.item as StudentSuspensionHistory & {
        days?: number;
        suspensionDays?: number;
        totalDays?: number;
      };

    const provided =
      value.days ??
      value.suspensionDays ??
      value.totalDays;

    if (provided != null) {
      return Number(provided);
    }

    const from =
      this.parseDate(
        this.startDate,
      );

    const to =
      this.parseDate(
        this.endDate,
      );

    if (!from || !to) {
      return 0;
    }

    return Math.max(
      0,
      Math.ceil(
        (
          to.getTime() -
          from.getTime()
        ) /
        86400000,
      ),
    );
  }


  /* =========================
     REASON
  ========================= */

  get reason(): string {
    if (!this.item) {
      return 'Sin motivo registrado';
    }

    const value =
      this.item as StudentSuspensionHistory & {
        reason?: string;
        motive?: string;
        reasonDescription?: string;
        description?: string;
      };

    return (
      value.reason ??
      value.motive ??
      value.reasonDescription ??
      value.description ??
      'Sin motivo registrado'
    );
  }


  /* =========================
     PROCESSED BY
  ========================= */

  get processedByName(): string {
    if (!this.item) {
      return 'Sin información';
    }

    const value =
      this.item as StudentSuspensionHistory & {
        processedByName?: string;
        processedBy?: {
          firstName?: string;
          lastName?: string;
          name?: string;
        };
        createdBy?: {
          firstName?: string;
          lastName?: string;
          name?: string;
        };
      };

    if (value.processedByName) {
      return value.processedByName;
    }

    if (value.processedBy?.name) {
      return value.processedBy.name;
    }

    if (value.createdBy?.name) {
      return value.createdBy.name;
    }

    const firstName =
      value.processedBy?.firstName ??
      value.createdBy?.firstName ??
      '';

    const lastName =
      value.processedBy?.lastName ??
      value.createdBy?.lastName ??
      '';

    return (
      `${firstName} ${lastName}`.trim() ||
      'Sin información'
    );
  }


  /* =========================
     STATUS
  ========================= */

  get status():
    'active' |
    'finished' |
    'upcoming' {

    if (!this.item) {
      return 'finished';
    }

    const value =
      this.item as StudentSuspensionHistory & {
        active?: boolean;
        isActive?: boolean;
        status?: string;
      };

    if (
      value.active === true ||
      value.isActive === true
    ) {
      return 'active';
    }

    const rawStatus =
      String(
        value.status ?? '',
      )
        .trim()
        .toLowerCase();

    if (
      rawStatus === 'active' ||
      rawStatus === 'activa'
    ) {
      return 'active';
    }

    if (
      rawStatus === 'upcoming' ||
      rawStatus === 'pending' ||
      rawStatus === 'próxima'
    ) {
      return 'upcoming';
    }

    const start =
      this.parseDate(
        this.startDate,
      );

    const end =
      this.parseDate(
        this.endDate,
      );

    const now =
      new Date();

    if (
      start &&
      now < start
    ) {
      return 'upcoming';
    }

    if (
      start &&
      end &&
      now >= start &&
      now <= end
    ) {
      return 'active';
    }

    return 'finished';
  }


  get statusLabel(): string {
    switch (this.status) {
      case 'active':
        return 'Activa';

      case 'upcoming':
        return 'Próxima';

      default:
        return 'Finalizada';
    }
  }


  /* =========================
     CREATED
  ========================= */

  get createdAt(): string {
    if (!this.item) {
      return '';
    }

    const value =
      this.item as StudentSuspensionHistory & {
        createdAt?: string;
        created_at?: string;
        registrationDate?: string;
      };

    return (
      value.createdAt ??
      value.created_at ??
      value.registrationDate ??
      ''
    );
  }


  /* =========================
     FORMAT
  ========================= */

  formatDate(
    value?: string,
  ): string {
    if (!value) {
      return '—';
    }

    const date =
      this.parseDate(value);

    if (!date) {
      return value;
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    ).format(date);
  }


  formatDateTime(
    value?: string,
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
      return value;
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
    ).format(date);
  }


  private parseDate(
    value?: string,
  ): Date | null {
    if (!value) {
      return null;
    }

    const dateOnly =
      /^\d{4}-\d{2}-\d{2}$/
        .test(value);

    if (dateOnly) {
      const [
        year,
        month,
        day,
      ] = value
        .split('-')
        .map(Number);

      return new Date(
        year,
        month - 1,
        day,
      );
    }

    const date =
      new Date(value);

    return Number.isNaN(
      date.getTime(),
    )
      ? null
      : date;
  }
}