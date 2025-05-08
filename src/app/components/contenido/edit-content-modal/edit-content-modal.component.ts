import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StudyContentDto, StudyContentUpdateDto } from '../../../services/dtos/study-content.dto';

@Component({
  selector: 'app-edit-content-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-content-modal.component.html',
  styleUrls: ['./edit-content-modal.component.scss']
})
export class EditContentModalComponent implements OnInit {
  @Input() content!: StudyContentDto;
  @Output() update = new EventEmitter<StudyContentUpdateDto>();
  @Output() close = new EventEmitter<void>();

  editForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.editForm = this.fb.group({
      unit: [null, [Validators.required, Validators.min(1)]],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      textContent: [''],
      enabled: [true] 
    });
  }

  ngOnInit(): void {
    if (this.content) {
      this.editForm.patchValue({
        unit: this.content.unit,
        title: this.content.title,
        description: this.content.description,
        textContent: this.content.content
          ? this.tryExtractText(this.content.content)
          : ''
      });
    }
  }

  private tryExtractText(raw: string): string {
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === 'string' ? parsed : '';
    } catch {
      return raw ?? '';
    }
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
  
    const formValues = this.editForm.value;
  
    const updatedData: StudyContentUpdateDto = {
      stageId: this.content.stageId,
      unit: formValues.unit,
      title: formValues.title,
      description: formValues.description,
      content: formValues.textContent ? JSON.stringify(formValues.textContent.trim()) : ''
    };
  
    this.update.emit(updatedData);
  }

  onClose(): void {
    this.close.emit();
  }
}