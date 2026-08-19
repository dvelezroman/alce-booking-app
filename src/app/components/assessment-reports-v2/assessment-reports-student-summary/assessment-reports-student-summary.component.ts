import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import {
  AssessementI,
} from '../../../services/dtos/assessment.dto';

@Component({
  selector: 'app-assessment-reports-student-summary',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './assessment-reports-student-summary.component.html',
  styleUrl: './assessment-reports-student-summary.component.scss',
})
export class AssessmentReportsStudentSummaryComponent {

  @Input() assessments: AssessementI[] = [];

  @Input() studentId: number | null = null;

  @Input() stageId: number | null = null;

  @Input() stageDescription = '';


  get student(): any | null {
    if (!this.assessments.length) {
      return null;
    }

    return this.assessments[0]?.student ?? null;
  }


  get user(): any | null {
    return (
      this.student?.user ??
      this.student ??
      null
    );
  }


  get hasStudent(): boolean {
    return (
      this.studentId !== null ||
      !!this.student
    );
  }


  get fullName(): string {
    const firstName =
      this.user?.firstName ??
      this.student?.firstName ??
      '';

    const lastName =
      this.user?.lastName ??
      this.student?.lastName ??
      '';

    const fullName =
      `${firstName} ${lastName}`.trim();

    return (
      fullName ||
      'Estudiante seleccionado'
    );
  }


  get initials(): string {
    const firstName =
      (
        this.user?.firstName ??
        this.student?.firstName ??
        ''
      )
        .trim()
        .charAt(0);

    const lastName =
      (
        this.user?.lastName ??
        this.student?.lastName ??
        ''
      )
        .trim()
        .charAt(0);

    return (
      `${firstName}${lastName}`
        .toUpperCase() ||
      'ES'
    );
  }


  get resolvedStudentId(): string {
    const id =
      this.student?.id ??
      this.studentId;

    return id != null
      ? String(id)
      : '—';
  }


  get email(): string {
    return (
      this.user?.emailAddress ??
      this.user?.email ??
      this.student?.emailAddress ??
      this.student?.email ??
      'Sin correo'
    );
  }


  get modality(): string {
    return (
      this.student?.mode ??
      this.student?.modality ??
      'Sin información'
    );
  }


  get classification(): string {
    return (
      this.student?.classification ??
      this.student?.category ??
      'Sin información'
    );
  }


  get stageLabel(): string {
    const stageNumber =
      this.student?.stage?.number ??
      this.student?.stage?.stageNumber ??
      this.student?.stageNumber ??
      this.stageId;

    if (!stageNumber) {
      return 'Sin stage';
    }

    return `STG ${stageNumber}`;
  }


  get currentStageDescription(): string {
    return (
      this.stageDescription ||
      this.student?.stage?.description ||
      this.student?.stageDescription ||
      ''
    );
  }

}