import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
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

import { Stage } from '../../../services/dtos/student.dto';
import { StagesService } from '../../../services/stages.service';


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
export class StageResourceFormModalComponent implements OnInit, OnChanges {

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

  stages: { id: number; label: string }[] = [];


  constructor(
    private fb: FormBuilder,
    private stagesService: StagesService,
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


  ngOnInit(): void {
    this.loadStages();
  }

  private loadStages(): void {
    this.stagesService.getAll().subscribe({
      next: (stages) => {
        this.stages = this.prepareStages(stages).map((s) => ({
          id: s.id,
          label: this.stageLabel(s),
        }));
      },
      error: () => {
        this.stages = [];
      },
    });
  }

  private prepareStages(stages: Stage[]): Stage[] {
    const valid = this.filterValidStages(stages);
    return this.sortStages(valid);
  }

  private filterValidStages(stages: Stage[]): Stage[] {
    return stages.filter((s) => {
      const num = s.number?.trim().toUpperCase();
      if (num === 'ACTIVITIES') {
        return true;
      }
      return /^STG\s*(1?\d|0)$/.test(num);
    });
  }

  private sortStages(stages: Stage[]): Stage[] {
    const activities = stages.find(
      (s) => s.number.toUpperCase() === 'ACTIVITIES',
    );
    const list = stages.filter(
      (s) => s.number.toUpperCase() !== 'ACTIVITIES',
    );

    list.sort((a, b) => {
      const aNum = parseInt(a.number.replace('STG', '').trim(), 10);
      const bNum = parseInt(b.number.replace('STG', '').trim(), 10);
      return aNum - bNum;
    });

    return activities ? [activities, ...list] : list;
  }

  private stageLabel(stage: Stage): string {
    const desc = stage.description?.trim();
    return desc ? `${stage.number} — ${desc}` : stage.number;
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