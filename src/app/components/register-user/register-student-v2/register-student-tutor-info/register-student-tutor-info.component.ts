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
  selector: 'app-register-student-tutor-info',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './register-student-tutor-info.component.html',
  styleUrl: './register-student-tutor-info.component.scss',
})
export class RegisterStudentTutorInfoComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input({ required: true })
  registerForm!: FormGroup;

  @Input()
  isMinor = false;


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
      (
        control.touched ||
        control.dirty
      ) &&
      this.isEmpty(
        control.value,
      )
    );
  }


  /* =========================
     REQUIRED STATE
  ========================= */

  isTutorFieldRequired(): boolean {
    return this.isMinor;
  }


  /* =========================
     FIELD VALUE
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


  /* =========================
     EMPTY
  ========================= */

  private isEmpty(
    value: unknown,
  ): boolean {
    return (
      value === null ||
      value === undefined ||
      String(value).trim() === ''
    );
  }
}