import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-assessment-type-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './assessment-type-form.component.html',
  styleUrls: ['./assessment-type-form.component.scss'],
})
export class AssessmentTypeFormComponent {
  @Output() formSubmit = new EventEmitter<{ name: string; description?: string }>();
  showForm: boolean = false;
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
    });
  }

  submitForm(): void {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
      this.form.reset();
    } else {
      this.form.markAllAsTouched();
    }
  }
}