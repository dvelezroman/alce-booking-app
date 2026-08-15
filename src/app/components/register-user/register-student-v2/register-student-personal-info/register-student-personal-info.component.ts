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
  selector: 'app-register-student-personal-info',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './register-student-personal-info.component.html',
  styleUrl: './register-student-personal-info.component.scss',
})
export class RegisterStudentPersonalInfoComponent {

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


  /* =========================
     REQUIRED ERROR
  ========================= */

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
     EMAIL ERROR
  ========================= */

  hasEmailError(
    controlName: string,
  ): boolean {
    const control =
      this.registerForm?.get(
        controlName,
      );

    return !!(
      control &&
      control.hasError('email') &&
      (
        control.touched ||
        control.dirty
      )
    );
  }


  /* =========================
     PASSWORD ERROR
  ========================= */

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


  /* =========================
     CONTROL VALUE
  ========================= */

  getControlValue(
    controlName: string,
  ): string {
    return (
      this.registerForm
        ?.get(controlName)
        ?.value ||
      ''
    );
  }
}