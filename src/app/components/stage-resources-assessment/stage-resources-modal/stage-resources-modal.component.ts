import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StageAssessmentResource } from '../../../services/dtos/stage-resources.dto';

@Component({
  selector: 'app-stage-resources-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stage-resources-modal.component.html',
  styleUrl: './stage-resources-modal.component.scss'
})
export class StageResourcesModalComponent {

  @Input() resourceToEdit: StageAssessmentResource | null = null;
  @Output() update = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  editForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.editForm = this.fb.group({
      description: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern('https?://.+')]],
      active: [true]
    });
  }

  ngOnChanges() {
    if (this.resourceToEdit) {
      this.editForm.patchValue({
        description: this.resourceToEdit.description,
        url: this.resourceToEdit.url,
        active: this.resourceToEdit.active
      });
    }
  }

  submit() {
    if (this.editForm.invalid) return;
    this.update.emit(this.editForm.value);
  }

  close() {
    this.cancel.emit();
  }
}