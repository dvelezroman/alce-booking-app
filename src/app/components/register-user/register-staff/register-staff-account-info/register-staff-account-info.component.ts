import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

import {
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  MeetingLinkDto,
} from '../../../../services/dtos/booking.dto';

@Component({
  selector: 'app-register-staff-account-info',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './register-staff-account-info.component.html',
  styleUrl: './register-staff-account-info.component.scss',
})
export class RegisterStaffAccountInfoComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input({ required: true })
  registerForm!: FormGroup;

  @Input()
  roles: string[] = [];

  @Input()
  links: MeetingLinkDto[] = [];

  @Input()
  showInstructorLink = false;


  /* =========================
     VALIDATION
  ========================= */

  isInvalid(
    controlName: string,
  ): boolean {
    const control =
      this.registerForm?.get(
        controlName,
      );

    return !!(
      control &&
      control.invalid &&
      (
        control.touched ||
        control.dirty
      )
    );
  }


  hasRequiredError(
    controlName: string,
  ): boolean {
    const control =
      this.registerForm?.get(
        controlName,
      );

    return !!(
      control &&
      control.hasError('required') &&
      (
        control.touched ||
        control.dirty
      )
    );
  }


  /* =========================
     ROLE
  ========================= */

  getRoleLabel(
    role: string,
  ): string {
    switch (role) {
      case 'INSTRUCTOR':
        return 'Instructor';

      case 'ADMIN':
        return 'Administrador';

      default:
        return role;
    }
  }


  get selectedRole(): string {
    return (
      this.registerForm
        ?.get('role')
        ?.value ||
      ''
    );
  }


  get isAdminSelected(): boolean {
    return (
      this.selectedRole ===
      'ADMIN'
    );
  }


  get isInstructorSelected(): boolean {
    return (
      this.selectedRole ===
      'INSTRUCTOR'
    );
  }


  /* =========================
     LINK
  ========================= */

  getLinkLabel(
    link: MeetingLinkDto,
  ): string {
    return (
      link.description ||
      link.link ||
      `Enlace ${link.id}`
    );
  }


  get selectedInstructorLink(): string | number | null {
    return (
      this.registerForm
        ?.get('instructorLink')
        ?.value ??
      null
    );
  }


  get hasInstructorLinkSelected(): boolean {
    const value =
      this.selectedInstructorLink;

    return (
      value !== null &&
      value !== undefined &&
      value !== ''
    );
  }


  get isInstructorLinkDisabled(): boolean {
    return (
      !this.isInstructorSelected
    );
  }


  /* =========================
     OPTION STATES
  ========================= */

  isRoleDisabled(
    role: string,
  ): boolean {
    if (
      role === 'ADMIN' &&
      this.hasInstructorLinkSelected
    ) {
      return true;
    }

    return false;
  }


  /* =========================
     CHANGE ROLE
  ========================= */

  onRoleChange(): void {
    const role =
      this.selectedRole;

    if (
      role !== 'INSTRUCTOR'
    ) {
      this.registerForm
        .get('instructorLink')
        ?.reset('');
    }
  }


  /* =========================
     CHANGE LINK
  ========================= */

  onInstructorLinkChange(): void {
    if (
      this.hasInstructorLinkSelected &&
      this.selectedRole !== 'INSTRUCTOR'
    ) {
      this.registerForm
        .get('role')
        ?.setValue(
          'INSTRUCTOR',
        );
    }
  }
}