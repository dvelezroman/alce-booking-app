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

  isInvalid(controlName: string): boolean {
    const control =
      this.registerForm?.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (
        control.touched ||
        control.dirty
      )
    );
  }


  hasRequiredError(controlName: string): boolean {
    const control =
      this.registerForm?.get(controlName);

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

  getRoleLabel(role: string): string {
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
    return this.selectedRole === 'ADMIN';
  }


  get isInstructorSelected(): boolean {
    return this.selectedRole === 'INSTRUCTOR';
  }


  /* =========================
     LINK
  ========================= */

  getLinkLabel(link: MeetingLinkDto): string {
    return (
      link.description ||
      link.link ||
      `Enlace ${link.id}`
    );
  }


  get selectedInstructorLink(): MeetingLinkDto | null {
    return (
      this.registerForm
        ?.get('instructorLink')
        ?.value ??
      null
    );
  }


  get hasInstructorLinkSelected(): boolean {
    return this.selectedInstructorLink !== null;
  }


  get isInstructorLinkDisabled(): boolean {
    return !this.isInstructorSelected;
  }


  /* =========================
     CHANGE ROLE
  ========================= */

  onRoleChange(): void {
    if (!this.isInstructorSelected) {
      this.registerForm
        .get('instructorLink')
        ?.setValue(null);
    }
  }


  /* =========================
     CHANGE LINK
  ========================= */

  onInstructorLinkChange(): void {
    if (
      this.hasInstructorLinkSelected &&
      !this.isInstructorSelected
    ) {
      this.registerForm
        .get('role')
        ?.setValue('INSTRUCTOR');
    }
  }
}