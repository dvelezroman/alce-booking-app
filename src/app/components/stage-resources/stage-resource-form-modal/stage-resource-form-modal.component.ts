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
  StageAssessmentResource
} from '../../../services/dtos/stage-resources.dto';


@Component({
  selector: 'app-stage-resource-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './stage-resource-form-modal.component.html',
  styleUrl: './stage-resource-form-modal.component.scss'
})
export class StageResourceFormModalComponent implements OnChanges {

  /* =========================
     INPUTS
  ========================= */

  @Input() show = false;

  @Input() mode: 'create' | 'edit' = 'create';

  @Input() resource: StageAssessmentResource | null = null;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() createResource = new EventEmitter<{
    stageId: number;
    description: string;
    url: string;
    active: boolean;
  }>();

  @Output() updateResource = new EventEmitter<{
    stageId: number;
    description: string;
    url: string;
    active: boolean;
  }>();

  @Output() close =
    new EventEmitter<void>();


  /* =========================
     FORM
  ========================= */

  resourceForm: FormGroup;

  isSubmitting = false;


  /* =========================
     STAGES
  ========================= */

  stages = [
    { id: 1, label: 'Stage 1' },
    { id: 2, label: 'Stage 2' },
    { id: 3, label: 'Stage 3' },
    { id: 4, label: 'Stage 4' },
    { id: 5, label: 'Stage 5' },
    { id: 6, label: 'Stage 6' },
    { id: 7, label: 'Stage 7' },
    { id: 8, label: 'Stage 8' }
  ];


  constructor(
    private fb: FormBuilder
  ) {

    this.resourceForm = this.fb.group({
      stageId: [
        null,
        [
          Validators.required
        ]
      ],

      description: [
        '',
        [
          Validators.required,
          Validators.maxLength(250)
        ]
      ],

      url: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^https?:\/\/.+/i
          )
        ]
      ],

      active: [
        true
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
      changes['resource']
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
        stageId:
          this.resource.stageId,

        description:
          this.resource.description || '',

        url:
          this.resource.url || '',

        active:
          this.resource.active
      });

      return;
    }

    this.resourceForm.reset({
      stageId: null,
      description: '',
      url: '',
      active: true
    });
  }


  /* =========================
     GETTERS
  ========================= */

  get stageControl() {
    return this.resourceForm.get('stageId');
  }


  get descriptionControl() {
    return this.resourceForm.get('description');
  }


  get urlControl() {
    return this.resourceForm.get('url');
  }


  get modalTitle(): string {

    return this.mode === 'edit'
      ? 'Editar recurso'
      : 'Nuevo recurso';
  }


  get modalDescription(): string {

    return this.mode === 'edit'
      ? 'Actualiza la información del recurso asociado al Stage.'
      : 'Agrega un nuevo recurso académico asociado a un Stage.';
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

    const formValue =
      this.resourceForm.getRawValue();

    const payload = {
      stageId:
        Number(formValue.stageId),

      description:
        formValue.description.trim(),

      url:
        formValue.url.trim(),

      active:
        !!formValue.active
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


  onBackdropClick(): void {
    this.onClose();
  }


  stopPropagation(
    event: MouseEvent
  ): void {

    event.stopPropagation();
  }

}