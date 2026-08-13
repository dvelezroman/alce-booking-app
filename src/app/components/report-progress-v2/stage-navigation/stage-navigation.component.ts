import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  Stage,
} from '../../../services/dtos/student.dto';


@Component({
  selector: 'app-stage-navigation',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './stage-navigation.component.html',
  styleUrl: './stage-navigation.component.scss',
})
export class StageNavigationComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() stages: Stage[] = [];

  @Input() currentStage: Stage | null = null;

  @Input() currentStageIndex: number = 0;

  @Input() studentCurrentStageProgress: number = 0;

  @Input() canGoPrevious: boolean = false;

  @Input() canGoNext: boolean = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() previousStage =
    new EventEmitter<void>();

  @Output() nextStage =
    new EventEmitter<void>();


  /* =========================
     STAGE
  ========================= */

  get stageNumber(): string {
    return (
      this.currentStage?.number ??
      ''
    );
  }


  get stageDescription(): string {
    return (
      this.currentStage
        ?.description
        ?.trim() ??
      ''
    );
  }


  get stageTitle(): string {

    if (!this.currentStage) {
      return 'Stage no disponible';
    }


    const number =
      this.stageNumber;

    const description =
      this.stageDescription;


    if (
      number &&
      description
    ) {
      return `${number} - ${description}`;
    }


    if (number) {
      return number;
    }


    if (description) {
      return description;
    }


    return 'Stage';
  }


  /* =========================
     PROGRESS
  ========================= */

  get progressValue(): number {

    const value =
      Number(
        this.studentCurrentStageProgress ??
        0
      );


    if (
      Number.isNaN(value)
    ) {
      return 0;
    }


    return Math.min(
      100,
      Math.max(
        0,
        value,
      ),
    );
  }


  get formattedProgress(): string {
    return `${Math.round(this.progressValue)}%`;
  }


  /* =========================
     STAGE POSITION
  ========================= */

  get totalStages(): number {
    return this.stages.length;
  }


  get currentStagePosition(): number {

    if (
      this.totalStages === 0
    ) {
      return 0;
    }


    return (
      this.currentStageIndex + 1
    );
  }


  /* =========================
     STAGE DOTS
  ========================= */

  get stageDots(): number[] {

    return Array.from(
      {
        length:
          this.totalStages,
      },
      (_, index) => index,
    );
  }


  isCurrentStageDot(
    index: number,
  ): boolean {

    return (
      index ===
      this.currentStageIndex
    );
  }


  isPreviousStageDot(
    index: number,
  ): boolean {

    return (
      index <
      this.currentStageIndex
    );
  }


  /* =========================
     NAVIGATION
  ========================= */

  goPrevious(): void {

    if (
      !this.canGoPrevious
    ) {
      return;
    }


    this.previousStage.emit();
  }


  goNext(): void {

    if (
      !this.canGoNext
    ) {
      return;
    }


    this.nextStage.emit();
  }


  /* =========================
     TRACK BY
  ========================= */

  trackByStageDot(
    index: number,
    stageIndex: number,
  ): number {

    return stageIndex;
  }

}