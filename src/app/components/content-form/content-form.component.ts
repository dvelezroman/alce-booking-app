import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Stage } from '../../services/dtos/student.dto';

@Component({
  selector: 'app-content-form',
  standalone:true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './content-form.component.html',
  styleUrls: ['./content-form.component.scss'],
})
export class ContentFormComponent {
  @Input() isModalOpen: boolean = false;
  @Input() stages: Stage[] = [];
  @Output() closeModal = new EventEmitter<void>();
  @Output() formSubmit = new EventEmitter<any>();

  contentForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.contentForm = this.fb.group({
      stageId: [null, [Validators.required]],
      unit: [null, [Validators.required, Validators.min(1)]],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      textContent: ['', [Validators.required]],
      enabled: [true]
    });
  }

  onSubmit() {
    if (this.contentForm.valid) {
      const formValues = this.contentForm.value;

      const formData = {
        stageId: Number(formValues.stageId),
        unit: formValues.unit,
        title: formValues.title,
        description: formValues.description,
        content: formValues.textContent ?JSON.stringify(formValues.textContent) : '',
        enabled: formValues.enabled
      };

      this.formSubmit.emit(formData);
    }
  }

  close() {
    this.closeModal.emit();
  }
}
