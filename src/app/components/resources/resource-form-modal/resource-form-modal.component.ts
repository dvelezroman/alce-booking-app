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
  AssessmentResourceI
} from '../../../services/dtos/assessment-resources.dto';


@Component({
  selector: 'app-resource-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './resource-form-modal.component.html',
  styleUrl: './resource-form-modal.component.scss'
})
export class ResourceFormModalComponent implements OnChanges {

  /* =========================
     INPUTS
  ========================= */

  @Input() show = false;

  @Input() mode: 'create' | 'edit' = 'create';

  @Input() resource: AssessmentResourceI | null = null;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() createResource = new EventEmitter<{
    title: string;
    link: string;
  }>();

  @Output() updateResource = new EventEmitter<{
    title: string;
    link: string;
  }>();

  @Output() close = new EventEmitter<void>();


  /* =========================
     FORM
  ========================= */

  resourceForm: FormGroup;

  isSubmitting = false;


  constructor(
    private fb: FormBuilder
  ) {

    this.resourceForm = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ],

      link: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^https?:\/\/.+/i
          )
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
      changes['resource'] ||
      changes['mode'] ||
      changes['show']
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
      this.resource
    ) {

      this.resourceForm.reset({
        title: this.resource.title || '',
        link: this.resource.link || ''
      });

      return;
    }

    this.resourceForm.reset({
      title: '',
      link: ''
    });
  }


  /* =========================
     GETTERS
  ========================= */

  get titleControl() {
    return this.resourceForm.get('title');
  }


  get linkControl() {
    return this.resourceForm.get('link');
  }


  get modalTitle(): string {
    return this.mode === 'edit'
      ? 'Editar recurso'
      : 'Nuevo recurso';
  }


  get modalDescription(): string {
    return this.mode === 'edit'
      ? 'Actualiza la información del recurso académico.'
      : 'Agrega un nuevo recurso académico para los estudiantes.';
  }


  get submitLabel(): string {
    return this.mode === 'edit'
      ? 'Guardar cambios'
      : 'Crear recurso';
  }


  /* =========================
     SUBMIT
  ========================= */

  onSubmit(): void {

    if (this.resourceForm.invalid) {

      this.resourceForm.markAllAsTouched();

      return;
    }

    const payload = {
      title:
        this.resourceForm.value.title.trim(),

      link:
        this.resourceForm.value.link.trim()
    };

    if (this.mode === 'edit') {

      this.updateResource.emit(payload);

      return;
    }

    this.createResource.emit(payload);
  }


  /* =========================
     CLOSE
  ========================= */

  onClose(): void {

    this.resourceForm.reset();

    this.close.emit();
  }


  /* =========================
     OVERLAY
  ========================= */

  onBackdropClick(): void {
    this.onClose();
  }


  stopPropagation(
    event: MouseEvent
  ): void {

    event.stopPropagation();
  }

}