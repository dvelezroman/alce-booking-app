import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

import {
  Stage,
} from '../../../services/dtos/student.dto';

import {
  StudyContentDto,
  StudyContentPayloadI,
} from '../../../services/dtos/study-content.dto';


interface StageContentRow {
  id: number;
  title: string;
  description: string;
  unit: number | null;
  timesWorked: number;
  lastActivityDate: string | null;
  stageLabel: string;
}


@Component({
  selector: 'app-stage-content-list',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './stage-content-list.component.html',
  styleUrl: './stage-content-list.component.scss',
})
export class StageContentListComponent implements OnChanges {

  /* =========================
     INPUTS
  ========================= */

  @Input() currentStage: Stage | null = null;

  @Input() studentStageContents: StudyContentDto[] = [];

  @Input() studentContentHistory: StudyContentPayloadI[] = [];

  @Input() studentCurrentStageProgress: number = 0;


  /* =========================
     OUTPUTS
  ========================= */

  @Output() hasVisibleResults =
    new EventEmitter<boolean>();


  /* =========================
     LIFECYCLE
  ========================= */

  ngOnChanges(
    changes: SimpleChanges,
  ): void {

    if (
      changes['currentStage'] ||
      changes['studentStageContents'] ||
      changes['studentContentHistory']
    ) {

      Promise
        .resolve()
        .then(() => {

          this.hasVisibleResults.emit(
            this.visibleContents.length > 0,
          );

        });

    }
  }


  /* =========================
     CURRENT STAGE
  ========================= */

  get currentStageId(): number | null {

    return (
      this.currentStage?.id ??
      null
    );
  }


  get currentStageDescription(): string {

    return (
      this.currentStage
        ?.description
        ?.trim() ??
      ''
    );
  }


  get currentStageLabel(): string {

    if (!this.currentStage) {
      return 'Stage';
    }

    const number =
      this.currentStage.number ?? '';

    return number
      ? `Stage ${number}`
      : (
          this.currentStage.description ??
          'Stage'
        );
  }


  /* =========================
     VISIBLE CONTENTS
  ========================= */

  get visibleContents(): StageContentRow[] {

    if (!this.currentStage) {
      return [];
    }


    return this.studentStageContents.map(
      content => {

        const contentId =
          Number(
            (content as any)?.id ??
            0
          );


        const historyRecords =
          this.studentContentHistory.filter(
            history =>
              this.historyBelongsToCurrentStage(
                history,
              ) &&
              this.historyMatchesContent(
                history,
                content,
              ),
          );


        const dates =
          historyRecords.flatMap(
            history =>
              this.getHistoryDates(
                history,
              ),
          );


        const lastActivityDate =
          this.getLatestDate(
            dates,
          );


        return {
          id: contentId,

          title:
            this.getContentTitle(
              content,
            ),

          description:
            this.getContentDescription(
              content,
            ),

          unit:
            this.getContentUnit(
              content,
            ),

          timesWorked:
            dates.length,

          lastActivityDate,

          stageLabel:
            this.currentStageLabel,
        };

      },
    );
  }


  /* =========================
     TOTALS
  ========================= */

  get totalContents(): number {
    return this.visibleContents.length;
  }


  get workedContentsCount(): number {

    return this.visibleContents.filter(
      content =>
        content.timesWorked > 0
    ).length;
  }


  get unworkedContentsCount(): number {

    return Math.max(
      this.totalContents -
      this.workedContentsCount,
      0,
    );
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


  /* =========================
     HISTORY MATCH
  ========================= */

  private historyBelongsToCurrentStage(
    history: StudyContentPayloadI,
  ): boolean {

    if (!this.currentStage) {
      return false;
    }


    const stageId =
      Number(
        (history as any)?.stageId
      );


    if (
      !Number.isNaN(stageId) &&
      stageId ===
        this.currentStage.id
    ) {
      return true;
    }


    const dataStage =
      String(
        (history as any)
          ?.data
          ?.stage ??
        '',
      )
        .trim()
        .toLowerCase();


    const currentDescription =
      String(
        this.currentStage.description ??
        '',
      )
        .trim()
        .toLowerCase();


    if (
      dataStage &&
      currentDescription &&
      dataStage ===
        currentDescription
    ) {
      return true;
    }


    const stages =
      (history as any)?.stages;


    if (Array.isArray(stages)) {

      return stages.some(
        (stage: any) =>
          Number(stage?.id) ===
          this.currentStage?.id,
      );

    }


    return false;
  }


  private historyMatchesContent(
    history: StudyContentPayloadI,
    content: StudyContentDto,
  ): boolean {

    const historyId =
      Number(
        (history as any)?.id
      );


    const contentId =
      Number(
        (content as any)?.id
      );


    if (
      !Number.isNaN(historyId) &&
      !Number.isNaN(contentId) &&
      historyId === contentId
    ) {
      return true;
    }


    const historyTitle =
      String(
        (history as any)
          ?.data
          ?.title ??
        '',
      )
        .trim()
        .toLowerCase();


    const contentTitle =
      this.getContentTitle(
        content,
      )
        .trim()
        .toLowerCase();


    return !!(
      historyTitle &&
      contentTitle &&
      historyTitle ===
        contentTitle
    );
  }


  /* =========================
     CONTENT DATA
  ========================= */

  private getContentTitle(
    content: StudyContentDto,
  ): string {

    return (
      (content as any)?.title ??
      (content as any)?.data?.title ??
      'Contenido'
    );
  }


  private getContentDescription(
    content: StudyContentDto,
  ): string {

    return (
      (content as any)?.description ??
      (content as any)?.data?.description ??
      ''
    );
  }


  private getContentUnit(
    content: StudyContentDto,
  ): number | null {

    const raw =
      (content as any)?.unit ??
      (content as any)?.data?.unit ??
      null;


    if (
      raw === null ||
      raw === undefined
    ) {
      return null;
    }


    const value =
      Number(raw);


    return Number.isNaN(value)
      ? null
      : value;
  }


  /* =========================
     HISTORY DATES
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


  /* =========================
     DATE
  ========================= */

  private getLatestDate(
    dates: string[],
  ): string | null {

    if (
      dates.length === 0
    ) {
      return null;
    }


    const validDates =
      dates
        .map(date => ({
          raw: date,
          timestamp:
            new Date(date).getTime(),
        }))
        .filter(
          item =>
            !Number.isNaN(
              item.timestamp,
            ),
        )
        .sort(
          (a, b) =>
            b.timestamp -
            a.timestamp,
        );


    return (
      validDates[0]?.raw ??
      null
    );
  }


  formatDate(
    value: string | null,
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


  /* =========================
     TIMES WORKED
  ========================= */

  getTimesWorkedLabel(
    times: number,
  ): string {

    if (times === 0) {
      return 'Sin actividad';
    }


    if (times === 1) {
      return '1 vez';
    }


    return `${times} veces`;
  }


  /* =========================
     TRACK BY
  ========================= */

  trackByContentId(
    index: number,
    content: StageContentRow,
  ): number {

    return content.id;
  }

}