import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

import {
  Stage,
} from '../../../services/dtos/student.dto';

import {
  StudyContentDto,
  StudyContentPayloadI,
} from '../../../services/dtos/study-content.dto';


@Component({
  selector: 'app-student-progress-summary',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './student-progress-summary.component.html',
  styleUrl: './student-progress-summary.component.scss',
})
export class StudentProgressSummaryComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() studentId: number | null = null;

  @Input() currentStage: Stage | null = null;

  @Input() studentStageDescription: string = '';

  @Input() studentCurrentStageProgress: number = 0;

  @Input() studentStageContents: StudyContentDto[] = [];

  @Input() studentContentHistory: StudyContentPayloadI[] = [];


  /* =========================
     STAGE
  ========================= */

  get stageNumber(): string {
    return (
      this.currentStage?.number ??
      ''
    );
  }


  get stageTitle(): string {
    if (!this.currentStage) {
      return 'Stage no disponible';
    }

    const number =
      this.currentStage.number ?? '';

    return number
      ? `Stage ${number}`
      : 'Stage';
  }


  get stageDescription(): string {
    return (
      this.currentStage?.description?.trim() ||
      this.studentStageDescription?.trim() ||
      'Sin descripción'
    );
  }


  /* =========================
     PROGRESS
  ========================= */

  get progressValue(): number {

    const progress =
      Number(
        this.studentCurrentStageProgress ?? 0
      );

    if (
      Number.isNaN(progress)
    ) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        progress
      )
    );
  }


  get formattedProgress(): string {
    return `${Math.round(this.progressValue)}%`;
  }


  get progressCircleStyle(): string {
    return `${this.progressValue}%`;
  }


  /* =========================
     CONTENTS
  ========================= */

  get totalContents(): number {
    return (
      this.studentStageContents
        ?.length ??
      0
    );
  }


  /* =========================
     COMPLETED CONTENTS
  ========================= */

  get completedContents(): number {
    if (
      !this.currentStage ||
      this.studentContentHistory.length === 0
    ) {
      return 0;
    }

    const currentStageDescription =
      this.currentStage.description
        ?.trim()
        .toLowerCase();

    if (!currentStageDescription) {
      return 0;
    }

    const uniqueContents = new Set<string>();

    this.studentContentHistory
      .filter((record) => {
        const contentStage =
          record.data?.stage
            ?.trim()
            .toLowerCase();

        return (
          contentStage ===
          currentStageDescription
        );
      })
      .forEach((record) => {
        const stage =
          record.data?.stage
            ?.trim()
            .toLowerCase() ?? '';

        const unit =
          String(
            record.data?.unit ?? ''
          )
            .trim()
            .toLowerCase();

        const title =
          record.data?.title
            ?.trim()
            .toLowerCase() ?? '';

        if (!title) {
          return;
        }

        const uniqueKey =
          `${stage}|${unit}|${title}`;

        uniqueContents.add(uniqueKey);
      });

    return uniqueContents.size;
  }


  /* =========================
     PENDING CONTENTS
  ========================= */

  get pendingContents(): number {
    return Math.max(
      this.totalContents -
      this.completedContents,
      0,
    );
  }


  /* =========================
     REPORT DATE
  ========================= */

  get reportDate(): string {

    const now =
      new Date();


    const formatted =
      new Intl.DateTimeFormat(
        'es-EC',
        {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          timeZone:
            'America/Guayaquil',
        },
      ).format(now);


    return this.capitalize(
      formatted
    );
  }


  /* =========================
     STUDENT
  ========================= */

  get studentIdLabel(): string {
    if (!this.studentId) {
      return '--';
    }

    return String(
      this.studentId
    );
  }


  /* =========================
     PROGRESS STATE
  ========================= */

  get progressStatusLabel(): string {

    const progress =
      this.progressValue;


    if (progress >= 100) {
      return 'Completado';
    }

    if (progress >= 75) {
      return 'Avance alto';
    }

    if (progress >= 50) {
      return 'Buen avance';
    }

    if (progress > 0) {
      return 'En progreso';
    }

    return 'Sin progreso';
  }


  get progressStatusClass(): string {

    const progress =
      this.progressValue;


    if (progress >= 100) {
      return 'completed';
    }

    if (progress >= 75) {
      return 'high';
    }

    if (progress >= 50) {
      return 'medium';
    }

    if (progress > 0) {
      return 'low';
    }

    return 'empty';
  }


  /* =========================
     HISTORY
  ========================= */

  get hasHistory(): boolean {
    return (
      this.studentContentHistory
        .length > 0
    );
  }


  /* =========================
     HELPERS
  ========================= */

  private getHistoryContentId(
    record: StudyContentPayloadI,
  ): number | null {

    const raw =
      (record as any)?.studyContentId ??
      (record as any)?.contentId ??
      (record as any)?.data
        ?.studyContentId ??
      (record as any)?.data
        ?.contentId ??
      null;


    if (
      raw === null ||
      raw === undefined
    ) {
      return null;
    }


    const id =
      Number(raw);


    return Number.isNaN(id)
      ? null
      : id;
  }


  private capitalize(
    value: string,
  ): string {

    if (!value) {
      return '';
    }

    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );
  }

}