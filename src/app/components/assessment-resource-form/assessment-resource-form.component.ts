import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-assessment-resource-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './assessment-resource-form.component.html',
  styleUrls: ['./assessment-resource-form.component.scss']
})
export class AssessmentResourceFormComponent {
  @Output() formSubmit = new EventEmitter<{ title: string; link: string }>();

  showForm: boolean = false;
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      link: ['https://', [Validators.required, Validators.pattern('https?://.+')]]
    });
  }

  submitForm(): void {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
      this.form.reset();
      this.clearErrors();
    } else {
      this.form.markAllAsTouched();
    }
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.clearErrors();
    }
  }

  private clearErrors(): void {
    this.form.markAsUntouched();
    this.form.updateValueAndValidity();
  }
}