import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

import {
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-register-student-summary',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './register-student-summary.component.html',
  styleUrl: './register-student-summary.component.scss',
})
export class RegisterStudentSummaryComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input({ required: true })
  registerForm!: FormGroup;

  @Input()
  isMinor = false;


  /* =========================
     STUDENT
  ========================= */

  get studentName(): string {
    const firstName =
      this.getValue('firstName');

    const lastName =
      this.getValue('lastName');

    const fullName = [
      firstName,
      lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    return fullName || 'Nuevo estudiante';
  }


  get studentInitials(): string {
    const firstName =
      this.getValue('firstName');

    const lastName =
      this.getValue('lastName');

    const firstInitial =
      firstName
        ?.charAt(0)
        .toUpperCase() || '';

    const lastInitial =
      lastName
        ?.charAt(0)
        .toUpperCase() || '';

    return (
      `${firstInitial}${lastInitial}` ||
      'NE'
    );
  }


  /* =========================
     PERSONAL SECTION
  ========================= */

  get personalCompleted(): boolean {
    return this.hasValues([
      'firstName',
      'lastName',
      'idNumber',
      'email',
      'emailAddress',
      'password',
      'birthday',
    ]);
  }


  /* =========================
     ACADEMIC SECTION
  ========================= */

  get academicCompleted(): boolean {
    return this.hasValues([
      'studentClassification',
      'stageId',
      'mode',
    ]);
  }


  /* =========================
     TUTOR SECTION
  ========================= */

  get tutorCompleted(): boolean {
    if (!this.isMinor) {
      return true;
    }

    return this.hasValues([
      'tutorName',
      'tutorEmail',
      'tutorPhone',
    ]);
  }


  /* =========================
     REVIEW
  ========================= */

  get readyToReview(): boolean {
    return (
      this.personalCompleted &&
      this.academicCompleted &&
      this.tutorCompleted
    );
  }


  /* =========================
     STATUS
  ========================= */

  get registrationStatus(): string {
    return this.readyToReview
      ? 'Listo para registrar'
      : 'Pendiente';
  }


  get completedSections(): number {
    let completed = 0;

    if (this.personalCompleted) {
      completed++;
    }

    if (this.academicCompleted) {
      completed++;
    }

    if (
      !this.isMinor ||
      this.tutorCompleted
    ) {
      completed++;
    }

    if (this.readyToReview) {
      completed++;
    }

    return completed;
  }


  /* =========================
     PROGRESS
  ========================= */

  get progressPercentage(): number {
    return Math.round(
      (
        this.completedSections /
        4
      ) * 100,
    );
  }


  /* =========================
     SECTION STATES
  ========================= */

  get personalStatusClass(): string {
    return this.personalCompleted
      ? 'register-student-summary__step--completed'
      : 'register-student-summary__step--pending';
  }


  get academicStatusClass(): string {
    return this.academicCompleted
      ? 'register-student-summary__step--completed'
      : 'register-student-summary__step--pending';
  }


  get tutorStatusClass(): string {
    if (!this.isMinor) {
      return 'register-student-summary__step--optional';
    }

    return this.tutorCompleted
      ? 'register-student-summary__step--completed'
      : 'register-student-summary__step--pending';
  }


  get reviewStatusClass(): string {
    return this.readyToReview
      ? 'register-student-summary__step--completed'
      : 'register-student-summary__step--pending';
  }


  /* =========================
     TUTOR LABEL
  ========================= */

  get tutorLabel(): string {
    return this.isMinor
      ? 'Datos del tutor'
      : 'Datos del tutor (no requerido)';
  }


  /* =========================
     HELPERS
  ========================= */

  private getValue(
    controlName: string,
  ): string {
    const value =
      this.registerForm
        ?.get(controlName)
        ?.value;

    if (
      value === null ||
      value === undefined
    ) {
      return '';
    }

    return String(value).trim();
  }


  private hasValues(
    controls: string[],
  ): boolean {
    return controls.every(
      controlName =>
        !!this.getValue(
          controlName,
        ),
    );
  }
}