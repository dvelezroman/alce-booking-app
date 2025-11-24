import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { Stage } from '../../../services/dtos/student.dto';
import { StagesService } from '../../../services/stages.service';

@Component({
  selector: 'app-stage-resources-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './stage-resources-form.component.html',
  styleUrl: './stage-resources-form.component.scss',
})
export class StageResourcesAssessmentFormComponent implements OnInit {

  @Output() formSubmit = new EventEmitter<{
    stageId: number;
    description: string;
    url: string;
    active: boolean;
  }>();

  showForm = false;  
  form!: FormGroup;

  stages: Stage[] = [];

  constructor(
    private fb: FormBuilder,
    private stagesService: StagesService
  ) {}

  ngOnInit(): void {
    this.loadStages();
    this.initializeForm();
  }

  private initializeForm() {
    this.form = this.fb.group({
      stageId: [null, Validators.required],
      description: ['', Validators.required],
      url: [
        'https://',
        [Validators.required, Validators.pattern(/^https?:\/\/.+/)]
      ],
      active: [true]
    });
  }

  private loadStages() {
    this.stagesService.getAll().subscribe({
      next: (stages) => {
        this.stages = this.prepareStages(stages);
      },
      error: () => (this.stages = [])
    });
  }

  /** =============================== */
  /**   FILTRO + ORDENAMIENTO STAGES */
  /** =============================== */
  private prepareStages(stages: Stage[]): Stage[] {
    const valid = this.filterValidStages(stages);
    return this.sortStages(valid);
  }

  private filterValidStages(stages: Stage[]): Stage[] {
    return stages.filter((s) => {
      const num = s.number?.trim().toUpperCase();

      if (num === 'ACTIVITIES') return true;
      return /^STG\s*(1?\d|0)$/.test(num);
    });
  }

  private sortStages(stages: Stage[]): Stage[] {
    const activities = stages.find(s => s.number.toUpperCase() === 'ACTIVITIES');
    const list = stages.filter(s => s.number.toUpperCase() !== 'ACTIVITIES');

    list.sort((a, b) => {
      const aNum = parseInt(a.number.replace('STG', '').trim(), 10);
      const bNum = parseInt(b.number.replace('STG', '').trim(), 10);
      return aNum - bNum;
    });

    return activities ? [activities, ...list] : list;
  }

  /** =============================== */
  /**        SUBMIT FORMULARIO        */
  /** =============================== */
  submitForm() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmit.emit(this.form.value);

    this.form.reset({
      stageId: null,
      description: '',
      url: 'https://',
      active: true
    });

    this.clearErrors();
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.clearErrors();
    }
  }

  private clearErrors() {
    this.form.markAsUntouched();
    this.form.updateValueAndValidity();
  }
}