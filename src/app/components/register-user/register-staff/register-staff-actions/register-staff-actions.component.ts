import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-register-staff-actions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './register-staff-actions.component.html',
  styleUrl: './register-staff-actions.component.scss',
})
export class RegisterStaffActionsComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input({ required: true })
  registerForm!: FormGroup;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() submitRequested =
    new EventEmitter<void>();


  /* =========================
     SUBMIT
  ========================= */

  onSubmit(): void {
    this.submitRequested.emit();
  }


  /* =========================
     RESET
  ========================= */

  onReset(): void {
    this.registerForm.reset({
      idNumber: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      birthDate: '',
      role: '',
      instructorLink: '',
    });

    this.registerForm.markAsPristine();
    this.registerForm.markAsUntouched();
  }
}