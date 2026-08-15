import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  StageProgressByStage,
} from '../../../services/dtos/stage-progress.dto';


type StageProgressItem =
  StageProgressByStage[number];

type StageAssessmentStudentRow =
  StageProgressItem & {
    resourcesCount?: number;
  };

type ActiveStageAssessment =
  NonNullable<
    StageAssessmentStudentRow['activeAssessments']
  >[number];


@Component({
  selector: 'app-stage-assessment-active-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './stage-assessment-active-detail-modal.component.html',
  styleUrl: './stage-assessment-active-detail-modal.component.scss',
})
export class StageAssessmentActiveDetailModalComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  student: StageAssessmentStudentRow | null = null;

  @Input()
  assessments: ActiveStageAssessment[] = [];


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  closeRequested =
    new EventEmitter<void>();


  /* =========================
     CLOSE
  ========================= */

  onClose(): void {
    this.closeRequested.emit();
  }


  /* =========================
     STUDENT
  ========================= */

  get studentName(): string {
    const firstName =
      this.student?.student
        ?.user
        ?.firstName
        ?.trim() ||
      '';

    const lastName =
      this.student?.student
        ?.user
        ?.lastName
        ?.trim() ||
      '';

    return (
      `${firstName} ${lastName}`.trim() ||
      'Estudiante'
    );
  }


  get studentInitials(): string {
    const firstName =
      this.student?.student
        ?.user
        ?.firstName
        ?.trim() ||
      '';

    const lastName =
      this.student?.student
        ?.user
        ?.lastName
        ?.trim() ||
      '';

    return (
      `${firstName.charAt(0)}${lastName.charAt(0)}`
        .toUpperCase() ||
      '—'
    );
  }


  get studentEmail(): string {
    return (
      this.student?.student
        ?.user
        ?.email ||
      'Sin correo'
    );
  }


  /* =========================
     ASSESSMENT NAME
  ========================= */

  getAssessmentName(
    assessment: ActiveStageAssessment,
  ): string {
    return (
      assessment
        .stageAssessmentResource
        ?.description ||
      `Evaluación #${assessment.id}`
    );
  }


  /* =========================
     CREATOR
  ========================= */

  getCreatorName(
    assessment: ActiveStageAssessment,
  ): string {
    const firstName =
      assessment.creator
        ?.firstName
        ?.trim() ||
      '';

    const lastName =
      assessment.creator
        ?.lastName
        ?.trim() ||
      '';

    return (
      `${firstName} ${lastName}`.trim() ||
      'Sin información'
    );
  }


  /* =========================
     DATE
  ========================= */

  formatDate(
    value?: string | null,
  ): string {
    if (!value) {
      return 'Sin fecha';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return 'Sin fecha';
    }

    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    )
      .format(date)
      .replace('.', '');
  }


  formatTime(
    value?: string | null,
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


  /* =========================
     STATUS
  ========================= */

  isExpired(
    assessment: ActiveStageAssessment,
  ): boolean {
    if (!assessment.dueDate) {
      return false;
    }

    const dueDate =
      new Date(
        assessment.dueDate,
      );

    return (
      !Number.isNaN(
        dueDate.getTime(),
      ) &&
      dueDate.getTime() <
        Date.now()
    );
  }


  getStatusLabel(
    assessment: ActiveStageAssessment,
  ): string {
    if (
      assessment.finished &&
      this.student &&
      assessment.finished.includes(
        this.student.studentId,
      )
    ) {
      return 'Finalizada';
    }

    if (
      this.isExpired(
        assessment,
      )
    ) {
      return 'Vencida';
    }

    return 'Activa';
  }


  getStatusClass(
    assessment: ActiveStageAssessment,
  ): string {
    if (
      assessment.finished &&
      this.student &&
      assessment.finished.includes(
        this.student.studentId,
      )
    ) {
      return 'finished';
    }

    if (
      this.isExpired(
        assessment,
      )
    ) {
      return 'expired';
    }

    return 'active';
  }
}