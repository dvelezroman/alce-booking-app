import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  AssessmentTypeI
} from '../../../services/dtos/assessment-type.dto';


@Component({
  selector: 'app-assessment-type-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './assessment-type-form-modal.component.html',
  styleUrl: './assessment-type-form-modal.component.scss'
})
export class AssessmentTypeFormModalComponent implements OnChanges {

  /* =========================
     INPUTS
  ========================= */

  @Input() show = false;

  @Input() mode: 'create' | 'edit' = 'create';

  @Input() assessmentType: AssessmentTypeI | null = null;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() createAssessmentType =
    new EventEmitter<{
      name: string;
      description?: string;
    }>();

  @Output() updateAssessmentType =
    new EventEmitter<{
      name: string;
      description?: string;
    }>();

  @Output() close =
    new EventEmitter<void>();


  /* =========================
     FORM
  ========================= */

  form: FormGroup;

  isSubmitting = false;


  constructor(
    private fb: FormBuilder
  ) {

    this.form = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(120)
        ]
      ],

      description: [
        '',
        [
          Validators.maxLength(250)
        ]
      ]
    });
  }


  /* =========================
     CHANGES
  ========================= */

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes['show'] ||
      changes['mode'] ||
      changes['assessmentType']
    ) {
      this.prepareForm();
    }
  }


  /* =========================
     PREPARE FORM
  ========================= */

  private prepareForm(): void {

    if (!this.show) {
      return;
    }

    if (
      this.mode === 'edit' &&
      this.assessmentType
    ) {

      this.form.reset({
        name:
          this.assessmentType.name || '',

        description:
          this.assessmentType.description || ''
      });

      return;
    }

    this.form.reset({
      name: '',
      description: ''
    });
  }


  /* =========================
     GETTERS
  ========================= */

  get nameControl() {
    return this.form.get('name');
  }


  get descriptionControl() {
    return this.form.get('description');
  }


  get modalTitle(): string {

    return this.mode === 'edit'
      ? 'Editar tipo de evaluación'
      : 'Nuevo tipo de evaluación';
  }


  get modalDescription(): string {

    return this.mode === 'edit'
      ? 'Actualiza la información del tipo de evaluación.'
      : 'Crea un nuevo tipo que podrá utilizarse en las evaluaciones.';
  }


  get submitLabel(): string {

    return this.mode === 'edit'
      ? 'Guardar cambios'
      : 'Crear tipo';
  }


  /* =========================
     SUBMIT
  ========================= */

  onSubmit(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }

    const value =
      this.form.getRawValue();

    const description =
      value.description?.trim();

    const payload = {
      name:
        value.name.trim(),

      description:
        description || undefined
    };


    if (this.mode === 'edit') {

      this.updateAssessmentType.emit(
        payload
      );

      return;
    }

    this.createAssessmentType.emit(
      payload
    );
  }


  /* =========================
     CLOSE
  ========================= */

  onClose(): void {

    this.form.reset();

    this.close.emit();
  }


  onBackdropClick(): void {
    this.onClose();
  }


  stopPropagation(
    event: MouseEvent
  ): void {

    event.stopPropagation();
  }

}