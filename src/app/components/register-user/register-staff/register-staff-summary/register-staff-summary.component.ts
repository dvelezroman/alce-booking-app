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
  selector: 'app-register-staff-summary',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './register-staff-summary.component.html',
  styleUrl: './register-staff-summary.component.scss',
})
export class RegisterStaffSummaryComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input({ required: true })
  registerForm!: FormGroup;

  @Input()
  showInstructorLink = false;


  /* =========================
     USER
  ========================= */

  get userName(): string {
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

    return fullName || 'Nuevo usuario';
  }


  get userInitials(): string {
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
      'NU'
    );
  }


  /* =========================
     PERSONAL
  ========================= */

  get personalCompleted(): boolean {
    return this.hasValues([
      'firstName',
      'lastName',
      'idNumber',
      'email',
      'password',
    ]);
  }


  /* =========================
     ACCOUNT
  ========================= */

  get accountCompleted(): boolean {
    const role =
      this.getValue('role');

    if (!role) {
      return false;
    }

    if (
      role === 'INSTRUCTOR'
    ) {
      return !!this.getValue(
        'instructorLink',
      );
    }

    return true;
  }


  /* =========================
     REVIEW
  ========================= */

  get readyToReview(): boolean {
    return (
      this.personalCompleted &&
      this.accountCompleted
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


  /* =========================
     ROLE
  ========================= */

  get selectedRole(): string {
    const role =
      this.getValue('role');

    switch (role) {
      case 'INSTRUCTOR':
        return 'Instructor';

      case 'ADMIN':
        return 'Administrador';

      default:
        return '';
    }
  }


  /* =========================
     SECTION CLASSES
  ========================= */

  get personalStatusClass(): string {
    return this.personalCompleted
      ? 'register-staff-summary__step--completed'
      : 'register-staff-summary__step--pending';
  }


  get accountStatusClass(): string {
    return this.accountCompleted
      ? 'register-staff-summary__step--completed'
      : 'register-staff-summary__step--pending';
  }


  get reviewStatusClass(): string {
    return this.readyToReview
      ? 'register-staff-summary__step--completed'
      : 'register-staff-summary__step--pending';
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