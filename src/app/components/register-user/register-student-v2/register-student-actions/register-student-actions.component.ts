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
  selector: 'app-register-student-actions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './register-student-actions.component.html',
  styleUrl: './register-student-actions.component.scss',
})
export class RegisterStudentActionsComponent {

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
      firstName: '',
      lastName: '',
      idNumber: '',
      email: '',
      emailAddress: '',
      password: '',
      birthday: '',
      studentClassification: '',
      stageId: '',
      mode: '',
      startClassDate: '',
      endClassDate: '',
      tutorName: '',
      tutorEmail: '',
      tutorPhone: '',
    });

    this.registerForm.markAsPristine();
    this.registerForm.markAsUntouched();
  }


  /* =========================
     FORM STATE
  ========================= */

  get hasChanges(): boolean {
    return this.registerForm?.dirty ?? false;
  }
}