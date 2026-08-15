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
  selector: 'app-register-staff-personal-info',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './register-staff-personal-info.component.html',
  styleUrl: './register-staff-personal-info.component.scss',
})
export class RegisterStaffPersonalInfoComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input({ required: true })
  registerForm!: FormGroup;


  /* =========================
     FORM HELPERS
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


  hasMinLengthError(
    controlName: string,
  ): boolean {
    const control =
      this.registerForm?.get(
        controlName,
      );

    return !!(
      control &&
      control.hasError('minlength') &&
      (
        control.touched ||
        control.dirty
      )
    );
  }
}