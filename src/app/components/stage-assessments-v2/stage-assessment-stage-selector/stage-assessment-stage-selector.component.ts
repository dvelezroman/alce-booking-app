import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Stage } from '../../../services/dtos/student.dto';
import { StagesService } from '../../../services/stages.service';


@Component({
  selector: 'app-stage-assessment-stage-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './stage-assessment-stage-selector.component.html',
  styleUrl: './stage-assessment-stage-selector.component.scss',
})
export class StageAssessmentStageSelectorComponent implements OnInit {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  selectedStageId?: number;

  @Input()
  selectedStage: Stage | null = null;

  @Input()
  resourcesCount = 0;

  @Input()
  selectedStudentsCount = 0;

  @Input()
  isRecalculating = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  stageSelected =
    new EventEmitter<number>();

  @Output()
  recalculateRequested =
    new EventEmitter<void>();

  @Output()
  assignRequested =
    new EventEmitter<void>();


  /* =========================
     STAGES
  ========================= */

  stages: Stage[] = [];

  isLoadingStages = false;


  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor(
    private stagesService: StagesService,
  ) {}


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    this.loadStages();
  }


  /* =========================
     LOAD STAGES
  ========================= */

  private loadStages(): void {
    this.isLoadingStages = true;

    this.stagesService
      .getAll()
      .subscribe({
        next: (data) => {
          this.stages =
            data || [];

          this.isLoadingStages = false;
        },

        error: (err) => {
          console.error(
            'Error obteniendo stages:',
            err,
          );

          this.stages = [];

          this.isLoadingStages = false;
        },
      });
  }


  /* =========================
     SELECT STAGE
  ========================= */

  onStageChange(
    value: number | string | null,
  ): void {
    const stageId =
      Number(value);

    if (
      !Number.isFinite(stageId) ||
      stageId <= 0
    ) {
      return;
    }

    this.stageSelected.emit(
      stageId,
    );
  }


  /* =========================
     ACTIONS
  ========================= */

  onRecalculate(): void {
    if (
      !this.selectedStageId ||
      this.isRecalculating
    ) {
      return;
    }

    this.recalculateRequested.emit();
  }


  onAssignAssessment(): void {
    if (
      !this.selectedStageId ||
      this.selectedStudentsCount === 0
    ) {
      return;
    }

    this.assignRequested.emit();
  }


  /* =========================
     STAGE LABEL
  ========================= */

  getStageLabel(
    stage: Stage | null | undefined,
  ): string {
    if (!stage) {
      return '';
    }

    const data =
      stage as any;

    const number =
      data.stageNumber ??
      data.number ??
      data.id ??
      '';

    const description =
      data.description ??
      data.name ??
      '';

    if (
      number &&
      description
    ) {
      return `Stage ${number} - ${description}`;
    }

    if (description) {
      return description;
    }

    return `Stage ${number}`;
  }


  /* =========================
     SELECTED LABEL
  ========================= */

  get selectedStageLabel(): string {
    if (this.selectedStage) {
      return this.getStageLabel(
        this.selectedStage,
      );
    }

    const stage =
      this.stages.find(
        item =>
          item.id ===
          this.selectedStageId,
      );

    return (
      this.getStageLabel(stage) ||
      'Seleccionar etapa'
    );
  }


  /* =========================
     SELECTED STAGE INTERNAL
  ========================= */

  get currentStage(): Stage | null {
    if (this.selectedStage) {
      return this.selectedStage;
    }

    return (
      this.stages.find(
        item =>
          item.id ===
          this.selectedStageId,
      ) ||
      null
    );
  }
}