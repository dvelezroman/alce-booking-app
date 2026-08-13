import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';

import {
  Stage,
} from '../../../services/dtos/student.dto';

import {
  StudyContentPayloadI,
} from '../../../services/dtos/study-content.dto';


interface ProgressHistoryRow {
  key: string;
  date: string;
  stageId: number | null;
  stageLabel: string;
  contentTitle: string;
  instructorName: string;
  instructorInitials: string;
}


@Component({
  selector: 'app-progress-history-list',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './progress-history-list.component.html',
  styleUrl: './progress-history-list.component.scss',
})
export class ProgressHistoryListComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input() studentContentHistory: StudyContentPayloadI[] = [];
  @Input() stages: Stage[] = [];
  @Input() currentStage: Stage | null = null;


  /* =========================
     CURRENT STAGE
  ========================= */

  get currentStageId(): number | null {
    return (
      this.currentStage?.id ??
      null
    );
  }


  get currentStageLabel(): string {
    if (!this.currentStage) {
      return 'Stage';
    }

    const number =
      this.currentStage.number ?? '';

    const description =
      this.currentStage.description ?? '';

    if (number) {
      return `Stage ${this.normalizeStageNumber(number)}`;
    }

    return (
      description ||
      'Stage'
    );
  }


  /* =========================
     HISTORY
  ========================= */

  get currentStageHistory(): ProgressHistoryRow[] {

    if (!this.currentStage) {
      return [];
    }


    const rows: ProgressHistoryRow[] = [];


    this.studentContentHistory.forEach(
      history => {

        const dates =
          this.getHistoryDates(history);

        const instructors =
          this.getHistoryInstructors(history);

        const historyStages =
          this.getHistoryStages(history);


        /*
         * Cuando vienen arrays paralelos:
         *
         * dates[0]
         * instructors[0]
         * stages[0]
         *
         * representan la misma actividad.
         */
        dates.forEach(
          (date, index) => {

            const stage =
              historyStages[index] ??
              this.getFallbackStage(history);

            const stageId =
              stage?.id != null
                ? Number(stage.id)
                : this.getHistoryStageId(history);


            /*
             * IMPORTANTE:
             * solo mostramos registros
             * del stage seleccionado.
             */
            if (
              stageId !==
              this.currentStageId
            ) {
              return;
            }


            const instructor =
              instructors[index] ??
              this.getFallbackInstructor(
                history,
              );


            rows.push({
              key: `${history.stageId}-${index}-${date}-${history.data.title}`,

              date,

              stageId,

              stageLabel:
                history.data?.stage || '--',

              contentTitle:
                this.getHistoryTitle(history),

              instructorName:
                this.getInstructorName(instructor),

              instructorInitials:
                this.getInstructorInitials(instructor),
            });

          },
        );

      },
    );


    /*
     * Historial más reciente primero.
     */
    return rows.sort(
      (a, b) =>
        this.getTimestamp(b.date) -
        this.getTimestamp(a.date),
    );
  }


  /* =========================
     STATES
  ========================= */

  get hasHistory(): boolean {
    return (
      this.currentStageHistory.length > 0
    );
  }


  get totalHistoryRecords(): number {
    return this.currentStageHistory.length;
  }


  /* =========================
     DATE
  ========================= */

  formatDate(
    value: string,
  ): string {

    if (!value) {
      return '--';
    }


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return '--';
    }


    return new Intl.DateTimeFormat(
      'es-EC',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone:
          'America/Guayaquil',
      },
    ).format(date);
  }


  formatHour(
    value: string,
  ): string {

    if (!value) {
      return '';
    }


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return '';
    }


    return new Intl.DateTimeFormat(
      'es-EC',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone:
          'America/Guayaquil',
      },
    ).format(date);
  }


  /* =========================
     HISTORY DATA
  ========================= */

  private getHistoryDates(
    history: StudyContentPayloadI,
  ): string[] {

    const dates =
      (history as any)?.dates;


    if (
      Array.isArray(dates) &&
      dates.length > 0
    ) {

      return dates.filter(
        (date: unknown) =>
          typeof date === 'string' &&
          date.trim().length > 0,
      );
    }


    const date =
      (history as any)?.date;


    if (
      typeof date === 'string' &&
      date.trim()
    ) {
      return [date];
    }


    return [];
  }


  private getHistoryInstructors(
    history: StudyContentPayloadI,
  ): any[] {

    const instructors =
      (history as any)?.instructors;


    if (
      Array.isArray(instructors)
    ) {
      return instructors;
    }


    return [];
  }


  private getHistoryStages(
    history: StudyContentPayloadI,
  ): any[] {

    const stages =
      (history as any)?.stages;


    if (
      Array.isArray(stages)
    ) {
      return stages;
    }


    return [];
  }


  private getHistoryStageId(
    history: StudyContentPayloadI,
  ): number | null {

    const raw =
      (history as any)?.stageId;


    if (
      raw === undefined ||
      raw === null
    ) {
      return null;
    }


    const value =
      Number(raw);


    return Number.isNaN(value)
      ? null
      : value;
  }


  private getFallbackStage(
    history: StudyContentPayloadI,
  ): any | null {

    const stageId =
      this.getHistoryStageId(
        history,
      );


    if (stageId == null) {
      return null;
    }


    return (
      this.stages.find(
        stage =>
          stage.id === stageId,
      ) ??
      null
    );
  }


  private getFallbackInstructor(
    history: StudyContentPayloadI,
  ): any | null {

    return (
      (history as any)
        ?.instructor ??
      null
    );
  }


  private getHistoryTitle(
    history: StudyContentPayloadI,
  ): string {

    return (
      (history as any)
        ?.data
        ?.title ??
      (history as any)
        ?.title ??
      'Contenido'
    );
  }


  /* =========================
     STAGE
  ========================= */

  private getStageLabel(
    stage: any,
  ): string {

    if (!stage) {
      return this.currentStageLabel;
    }


    const number =
      stage?.number ??
      '';


    if (number) {
      return (
        `Stage ${this.normalizeStageNumber(
          String(number),
        )}`
      );
    }


    return (
      stage?.description ??
      this.currentStageLabel
    );
  }


  private normalizeStageNumber(
    value: string,
  ): string {

    const normalized =
      String(value)
        .replace(/[^0-9.]/g, '')
        .trim();


    return (
      normalized ||
      value
    );
  }


  /* =========================
     INSTRUCTOR
  ========================= */

  private getInstructorName(
    instructor: any,
  ): string {

    if (!instructor) {
      return 'Instructor';
    }


    const user =
      instructor?.user ??
      instructor;


    const firstName =
      user?.firstName
        ?.trim() ??
      '';

    const lastName =
      user?.lastName
        ?.trim() ??
      '';


    const fullName =
      `${firstName} ${lastName}`
        .trim();


    return (
      fullName ||
      'Instructor'
    );
  }


  private getInstructorInitials(
    instructor: any,
  ): string {

    if (!instructor) {
      return 'IN';
    }


    const user =
      instructor?.user ??
      instructor;


    const firstName =
      user?.firstName
        ?.trim()
        ?.charAt(0) ??
      '';

    const lastName =
      user?.lastName
        ?.trim()
        ?.charAt(0) ??
      '';


    return (
      `${firstName}${lastName}`
        .toUpperCase() ||
      'IN'
    );
  }


  /* =========================
     TIMESTAMP
  ========================= */

  private getTimestamp(
    value: string,
  ): number {

    const timestamp =
      new Date(value).getTime();


    return Number.isNaN(
      timestamp,
    )
      ? 0
      : timestamp;
  }


  /* =========================
     TRACK BY
  ========================= */

  trackByHistoryRow(
    index: number,
    row: ProgressHistoryRow,
  ): string {

    return row.key;
  }

}