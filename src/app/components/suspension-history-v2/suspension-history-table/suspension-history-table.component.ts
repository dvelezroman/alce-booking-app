import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import {
  StudentSuspensionHistory
} from '../../../services/dtos/student.dto';

@Component({
  selector: 'app-suspension-history-table',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './suspension-history-table.component.html',
  styleUrl: './suspension-history-table.component.scss'
})
export class SuspensionHistoryTableComponent {

  @Input() history: StudentSuspensionHistory[] = [];

  @Input() loading = false;

  @Output() viewRequested =
    new EventEmitter<StudentSuspensionHistory>();

  @Output() downloadRequested =
    new EventEmitter<StudentSuspensionHistory>();


  onView(
    item: StudentSuspensionHistory
  ): void {
    this.viewRequested.emit(item);
  }


  onDownload(
    item: StudentSuspensionHistory
  ): void {
    this.downloadRequested.emit(item);
  }


  getStudentName(
    item: StudentSuspensionHistory
  ): string {
    const value =
      item as StudentSuspensionHistory & {
        student?: {
          user?: {
            firstName?: string;
            lastName?: string;
          };
          firstName?: string;
          lastName?: string;
        };
        studentName?: string;
        student_name?: string;
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
      'Estudiante'
    );
  }


  getStudentInitials(
    item: StudentSuspensionHistory
  ): string {
    const name =
      this.getStudentName(item)
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
    item: StudentSuspensionHistory
  ): string {
    const value =
      item as StudentSuspensionHistory & {
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
      '—'
    );
  }


  getStudentEmail(
    item: StudentSuspensionHistory
  ): string {
    const value =
      item as StudentSuspensionHistory & {
        student?: {
          user?: {
            email?: string;
            emailAddress?: string;
          };
          email?: string;
        };
        email?: string;
      };

    return (
      value.student?.user?.emailAddress ??
      value.student?.user?.email ??
      value.student?.email ??
      value.email ??
      'Sin correo'
    );
  }


  getStage(
    item: StudentSuspensionHistory
  ): string {
    const value =
      item as StudentSuspensionHistory & {
        stageId?: number;
        stage_id?: number;
        stage?: {
          id?: number;
          number?: number;
          stageNumber?: number;
        };
        student?: {
          stage?: {
            id?: number;
            number?: number;
            stageNumber?: number;
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

    return stage
      ? `STG ${stage}`
      : '—';
  }


  getStartDate(
    item: StudentSuspensionHistory
  ): string {
    const value =
      item as StudentSuspensionHistory & {
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


  getEndDate(
    item: StudentSuspensionHistory
  ): string {
    const value =
      item as StudentSuspensionHistory & {
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


  getDays(
    item: StudentSuspensionHistory
  ): number {
    const value =
      item as StudentSuspensionHistory & {
        days?: number;
        suspensionDays?: number;
        totalDays?: number;
      };

    if (
      value.days !== undefined ||
      value.suspensionDays !== undefined ||
      value.totalDays !== undefined
    ) {
      return Number(
        value.days ??
        value.suspensionDays ??
        value.totalDays ??
        0
      );
    }

    const from =
      new Date(this.getStartDate(item));

    const to =
      new Date(this.getEndDate(item));

    if (
      Number.isNaN(from.getTime()) ||
      Number.isNaN(to.getTime())
    ) {
      return 0;
    }

    return Math.max(
      0,
      Math.ceil(
        (
          to.getTime() -
          from.getTime()
        ) /
        86400000
      )
    );
  }


  getReason(
    item: StudentSuspensionHistory
  ): string {
    const value =
      item as StudentSuspensionHistory & {
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


  getProcessedByName(
    item: StudentSuspensionHistory
  ): string {
    const value =
      item as StudentSuspensionHistory & {
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
        processedByName?: string;
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


  getProcessedByInitials(
    item: StudentSuspensionHistory
  ): string {
    const name =
      this.getProcessedByName(item)
        .trim()
        .split(/\s+/);

    if (!name.length) {
      return 'US';
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


  getStatus(
    item: StudentSuspensionHistory
  ): 'active' | 'finished' | 'upcoming' {
    const value =
      item as StudentSuspensionHistory & {
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
      String(value.status ?? '')
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
      new Date(this.getStartDate(item));

    const end =
      new Date(this.getEndDate(item));

    const now =
      new Date();

    if (
      !Number.isNaN(start.getTime()) &&
      now < start
    ) {
      return 'upcoming';
    }

    if (
      !Number.isNaN(start.getTime()) &&
      !Number.isNaN(end.getTime()) &&
      now >= start &&
      now <= end
    ) {
      return 'active';
    }

    return 'finished';
  }


  getStatusLabel(
    item: StudentSuspensionHistory
  ): string {
    switch (this.getStatus(item)) {
      case 'active':
        return 'Activa';

      case 'upcoming':
        return 'Próxima a finalizar';

      default:
        return 'Finalizada';
    }
  }


  getCreatedAt(
    item: StudentSuspensionHistory
  ): string {
    const value =
      item as StudentSuspensionHistory & {
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


  formatDate(
    value?: string
  ): string {
    if (!value) {
      return '—';
    }

    const date =
      new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    ).format(date);
  }


  formatTime(
    value?: string
  ): string {
    if (!value) {
      return '';
    }

    const date =
      new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
    ).format(date);
  }


  getAvatarClass(
    index: number
  ): string {
    const variants = [
      'history-student__avatar--purple',
      'history-student__avatar--blue',
      'history-student__avatar--green',
      'history-student__avatar--orange',
      'history-student__avatar--red'
    ];

    return variants[
      index % variants.length
    ];
  }
}