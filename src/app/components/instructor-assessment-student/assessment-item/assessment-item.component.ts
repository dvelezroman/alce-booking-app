import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import {
  AssessementI,
} from '../../../services/dtos/assessment.dto';

@Component({
  selector: 'app-assessment-item',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './assessment-item.component.html',
  styleUrl: './assessment-item.component.scss',
})
export class AssessmentItemComponent {

  @Input({ required: true })
  assessment!: AssessementI;

  @Input()
  minPointsAssessment: number | null = null;


  /* =========================
     POINTS
  ========================= */

  get points(): number {
    return this.assessment?.points ?? 0;
  }


  get pointsPercentage(): number {
    return Math.min(
      100,
      Math.max(0, this.points),
    );
  }


  /* =========================
     STATUS
  ========================= */

  get isApproved(): boolean {
    if (this.minPointsAssessment == null) {
      return false;
    }

    return (
      this.points >=
      this.minPointsAssessment
    );
  }


  get statusLabel(): string {
    return this.isApproved
      ? 'Aprobado'
      : 'No aprobado';
  }


  /* =========================
     TYPE
  ========================= */

  get assessmentType(): string {
    return String(
      this.assessment?.type ?? '',
    );
  }


  get assessmentTypeLabel(): string {
    const type =
      this.normalizeType(
        this.assessmentType,
      );

    switch (type) {
      case 'speaking':
        return 'Speaking';

      case 'grammar':
        return 'Grammar';

      case 'writing':
        return 'Writing';

      case 'listening':
        return 'Listening';

      case 'reading':
        return 'Reading';

      default:
        return this.formatTypeLabel(
          this.assessmentType,
        );
    }
  }


  get assessmentTypeDescription(): string {
    const type =
      this.normalizeType(
        this.assessmentType,
      );

    switch (type) {
      case 'speaking':
        return 'Evaluación de expresión oral en inglés.';

      case 'grammar':
        return 'Evaluación de gramática y estructura.';

      case 'writing':
        return 'Evaluación de redacción y coherencia.';

      case 'listening':
        return 'Evaluación de comprensión auditiva.';

      case 'reading':
        return 'Evaluación de comprensión lectora.';

      default:
        return 'Evaluación del estudiante.';
    }
  }


  /* =========================
     VISUAL TYPE
  ========================= */

  get typeClass(): string {
    const type =
      this.normalizeType(
        this.assessmentType,
      );

    switch (type) {
      case 'speaking':
        return 'speaking';

      case 'grammar':
        return 'grammar';

      case 'writing':
        return 'writing';

      case 'listening':
        return 'listening';

      case 'reading':
        return 'reading';

      default:
        return 'default';
    }
  }


  /* =========================
     SCORE VISUAL
  ========================= */

  get scoreClass(): string {
    return this.isApproved
      ? 'approved'
      : 'not-approved';
  }


  get scoreProgressStyle(): string {
    return `${this.pointsPercentage}%`;
  }

  /* =========================
   DATE / TIME
========================= */

get assessmentDateValue(): string | Date | null {
  return (
    (this.assessment as any)?.date ??
    (this.assessment as any)?.createdAt ??
    null
  );
}


get formattedDate(): string {
  if (!this.assessmentDateValue) {
    return '';
  }

  const date =
    new Date(this.assessmentDateValue);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Guayaquil',
  }).format(date);
}


get formattedWeekday(): string {
  if (!this.assessmentDateValue) {
    return '';
  }

  const date =
    new Date(this.assessmentDateValue);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const weekday =
    new Intl.DateTimeFormat('es-EC', {
      weekday: 'short',
      timeZone: 'America/Guayaquil',
    }).format(date);

  return this.capitalize(
    weekday.replace('.', '')
  );
}


get formattedHour(): string {
  if (!this.assessmentDateValue) {
    return '';
  }

  const date =
    new Date(this.assessmentDateValue);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Guayaquil',
  }).format(date);
}

  /* =========================
    INSTRUCTOR
  ========================= */

  get instructorName(): string {
    const user =
      (this.assessment as any)?.instructor?.user;

    if (!user) {
      return 'Instructor';
    }

    const firstName =
      user.firstName?.trim() ?? '';

    const lastName =
      user.lastName?.trim() ?? '';

    const fullName =
      `${firstName} ${lastName}`.trim();

    return fullName || 'Instructor';
  }


  get instructorInitials(): string {
    const user =
      (this.assessment as any)?.instructor?.user;

    if (!user) {
      return 'IN';
    }

    const firstName =
      user.firstName
        ?.trim()
        ?.charAt(0) ?? '';

    const lastName =
      user.lastName
        ?.trim()
        ?.charAt(0) ?? '';

    const initials =
      `${firstName}${lastName}`.toUpperCase();

    return initials || 'IN';
  }


  get instructorEmail(): string {
    const user =
      (this.assessment as any)?.instructor?.user;

    return (
      user?.email ??
      user?.emailAddress ??
      ''
    );
  }


  /* =========================
     HELPERS
  ========================= */

  private normalizeType(
    value: string,
  ): string {

    return value
      .trim()
      .toLowerCase()
      .replace(/[_\-\s]+/g, '');
  }


  private formatTypeLabel(
    value: string,
  ): string {

    if (!value) {
      return 'Evaluación';
    }

    const formatted =
      value
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .toLowerCase();

    return (
      formatted.charAt(0).toUpperCase() +
      formatted.slice(1)
    );
  }

  private capitalize(value: string): string {
    if (!value) {
      return '';
    }

    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );
  }

}