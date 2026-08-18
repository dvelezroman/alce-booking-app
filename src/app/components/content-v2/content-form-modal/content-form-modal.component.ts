import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  Stage,
} from '../../../services/dtos/student.dto';

import {
  StudyContentCreateDto,
  StudyContentDto,
  StudyContentUpdateDto,
} from '../../../services/dtos/study-content.dto';


type ContentFormMode =
  | 'create'
  | 'edit';


@Component({
  selector: 'app-content-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './content-form-modal.component.html',
  styleUrl: './content-form-modal.component.scss',
})
export class ContentFormModalComponent
  implements OnChanges {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  mode: ContentFormMode = 'create';

  @Input()
  stages: Stage[] = [];

  @Input()
  content: StudyContentDto | null = null;


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  saveRequested =
    new EventEmitter<StudyContentCreateDto>();

  @Output()
  updateRequested =
    new EventEmitter<StudyContentUpdateDto>();

  @Output()
  closeRequested =
    new EventEmitter<void>();


  /* =========================
     FORM
  ========================= */

  form: FormGroup;


  constructor(
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      stageId: [
        null,
        [
          Validators.required,
          Validators.min(1),
        ],
      ],

      unit: [
        null,
        [
          Validators.required,
          Validators.min(1),
        ],
      ],

      title: [
        '',
        [
          Validators.required,
        ],
      ],

      description: [
        '',
        [
          Validators.required,
        ],
      ],

      content: [
        '',
      ],

      enabled: [
        true,
      ],

      measurable: [
        true,
      ],
    });
  }


  /* =========================
     CHANGES
  ========================= */

  ngOnChanges(
    changes: SimpleChanges,
  ): void {
    if (
      changes['content'] ||
      changes['mode']
    ) {
      this.loadForm();
    }
  }


  /* =========================
     MODE
  ========================= */

  get isCreateMode(): boolean {
    return (
      this.mode === 'create'
    );
  }


  get isEditMode(): boolean {
    return (
      this.mode === 'edit'
    );
  }


  /* =========================
     HEADER
  ========================= */

  get title(): string {
    return this.isCreateMode
      ? 'Crear nuevo contenido'
      : 'Editar contenido';
  }


  get subtitle(): string {
    return this.isCreateMode
      ? 'Completa la información para crear un nuevo contenido.'
      : 'Actualiza la información del contenido.';
  }


  /* =========================
     BUTTON
  ========================= */

  get submitLabel(): string {
    return this.isCreateMode
      ? 'Crear contenido'
      : 'Guardar cambios';
  }


  /* =========================
     LOAD FORM
  ========================= */

  private loadForm(): void {
    if (
      this.isEditMode &&
      this.content
    ) {
      this.form.patchValue({
        stageId:
          this.content.stageId,

        unit:
          this.content.unit,

        title:
          this.content.title,

        description:
          this.content.description,

        content:
          this.parseContent(
            this.content.content,
          ),

        enabled:
          this.content.enabled,

        measurable:
          this.content.measurable,
      });

      return;
    }

    this.form.reset({
      stageId: null,
      unit: null,
      title: '',
      description: '',
      content: '',
      enabled: true,
      measurable: true,
    });
  }


  /* =========================
     CONTENT
  ========================= */

  private parseContent(
    content:
      string |
      null |
      undefined,
  ): string {
    if (!content) {
      return '';
    }

    try {
      const parsed =
        JSON.parse(content);

      return typeof parsed === 'string'
        ? parsed
        : content;
    } catch {
      return content;
    }
  }


  /* =========================
     SAVE
  ========================= */

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value =
      this.form.getRawValue();


    if (this.isCreateMode) {

      const payload:
        StudyContentCreateDto = {

        stageId:
          Number(value.stageId),

        unit:
          Number(value.unit),

        title:
          value.title.trim(),

        description:
          value.description.trim(),

        content:
          value.content?.trim() || '',

        enabled:
          !!value.enabled,

        measurable:
          !!value.measurable,

        createdAt:
          new Date(),

        updatedAt:
          new Date(),
      };

      this.saveRequested.emit(
        payload,
      );

      return;
    }


    const payload:
      StudyContentUpdateDto = {

      id:
        this.content?.id,

      stageId:
        Number(value.stageId),

      unit:
        Number(value.unit),

      title:
        value.title.trim(),

      description:
        value.description.trim(),

      content:
        value.content?.trim() || '',

      enabled:
        !!value.enabled,

      measurable:
        !!value.measurable,
    };

    this.updateRequested.emit(
      payload,
    );
  }


  /* =========================
     CLOSE
  ========================= */

  close(): void {
    this.closeRequested.emit();
  }


  onBackdropClick(
    event: MouseEvent,
  ): void {
    if (
      event.target ===
      event.currentTarget
    ) {
      this.close();
    }
  }


  /* =========================
     VALIDATION
  ========================= */

  isInvalid(
    controlName: string,
  ): boolean {
    const control =
      this.form.get(controlName);

    return !!(
      control &&
      control.invalid &&
      control.touched
    );
  }


  /* =========================
     STAGE LABEL
  ========================= */

  getStageLabel(
    stage: Stage,
  ): string {
    return (
      stage.number ||
      stage.description ||
      `Stage ${stage.id}`
    );
  }
}