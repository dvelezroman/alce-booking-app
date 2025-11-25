import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StageAssessmentResource } from '../../../services/dtos/stage-resources.dto';

@Component({
  selector: 'app-stage-assessment-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stage-assessment-create-modal.component.html',
  styleUrls: ['./stage-assessment-create-modal.component.scss']
})
export class StageAssessmentCreateModalComponent {

  @Input() isOpen: boolean = false;
  @Input() stageId!: number;
  @Input() studentIds: number[] = [];
  @Input() resources: StageAssessmentResource[] = [];

  @Output() submitForm = new EventEmitter<any>();
  @Output() closeModal = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      stageAssessmentResourceId: [null, Validators.required],
      dueDate: ['', Validators.required]
    });
  }

  ngOnChanges() {
    if (!this.isOpen) {
      this.form.reset();
    }
  }

  close() {
    this.closeModal.emit();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.value;
    const due = raw.dueDate + ":00.000Z";

    const payload = {
      stageId: this.stageId,
      studentIds: this.studentIds,
      stageAssessmentResourceId: +(this.form.value.stageAssessmentResourceId),
      dueDate: due
    };

    console.log("Payload listo para enviar:", payload);

    this.submitForm.emit(payload);
  }
}