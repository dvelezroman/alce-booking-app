import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-student-info-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-info-form.component.html',
  styleUrls: ['./student-info-form.component.scss'],
})
export class StudentInfoFormComponent {
  @Input() isModalOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() formSubmit = new EventEmitter<any>();

  infoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.infoForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contact: ['', [Validators.required, Validators.pattern('^[0-9]{7,15}$')]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      country: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  onSubmit() {
    if (this.infoForm.invalid) {
      this.infoForm.markAllAsTouched();
      return;
    }

    this.formSubmit.emit(this.infoForm.value);
  }

  close() {
    this.closeModal.emit();
  }
}