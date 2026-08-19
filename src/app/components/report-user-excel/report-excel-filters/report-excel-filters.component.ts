import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  UsersExcelFilterDto,
  AbsentStudentsExcelFilterDto,
} from '../../../services/dtos/reports.dto';

import {
  Stage,
} from '../../../services/dtos/student.dto';

export type ReportExcelMode =
  | 'users'
  | 'absents'
  | 'without-meetings';

@Component({
  selector: 'app-report-excel-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './report-excel-filters.component.html',
  styleUrl: './report-excel-filters.component.scss',
})
export class ReportExcelFiltersComponent {

  @Input() currentMode: ReportExcelMode =
    'users';

  @Input() stages: Stage[] = [];

  @Input() loading = false;

  @Output() usersRequested =
    new EventEmitter<UsersExcelFilterDto>();

  @Output() absentsRequested =
    new EventEmitter<AbsentStudentsExcelFilterDto>();

  @Output() withoutMeetingsRequested =
    new EventEmitter<AbsentStudentsExcelFilterDto>();


  /* =========================
     FILTERS
  ========================= */

  fromDate = '';

  toDate = '';

  selectedStageId:
    number | null = null;


  /* =========================
     TITLE
  ========================= */

  get sectionTitle(): string {
    switch (this.currentMode) {

      case 'absents':
        return 'Filtros de inasistencias';

      case 'without-meetings':
        return 'Filtros de estudiantes sin clases';

      case 'users':
      default:
        return 'Filtros del reporte';
    }
  }


  /* =========================
     DESCRIPTION
  ========================= */

  get sectionDescription(): string {
    switch (this.currentMode) {

      case 'absents':
        return 'Selecciona el rango de fechas y Stage para generar el reporte.';

      case 'without-meetings':
        return 'Define los criterios para consultar estudiantes sin clases agendadas.';

      case 'users':
      default:
        return 'Configura los criterios que deseas incluir en el reporte.';
    }
  }


  /* =========================
     STAGE LABEL
  ========================= */

  getStageLabel(
    stage: Stage,
  ): string {

    return (
      stage.number
        ? `${stage.number}${stage.description ? ` - ${stage.description}` : ''}`
        : `Stage ${stage.id}`
    );
  }


  /* =========================
     VALIDATION
  ========================= */

  get canGenerate(): boolean {

    if (this.loading) {
      return false;
    }

    /*
     * Para reportes de usuarios
     * permitimos generar sin filtros.
     */
    if (
      this.currentMode ===
      'users'
    ) {
      return true;
    }

    /*
     * Los reportes relacionados
     * con clases necesitan fechas.
     */
    return Boolean(
      this.fromDate &&
      this.toDate
    );
  }


  /* =========================
     GENERATE
  ========================= */

  onGenerate(): void {

    if (!this.canGenerate) {
      return;
    }

    switch (this.currentMode) {

      case 'absents':
        this.emitAbsents();
        break;

      case 'without-meetings':
        this.emitWithoutMeetings();
        break;

      case 'users':
      default:
        this.emitUsers();
        break;
    }
  }


  /* =========================
     USERS
  ========================= */

  private emitUsers(): void {

    const filters =
      {
        ...(this.fromDate
          ? { from: this.fromDate }
          : {}),

        ...(this.toDate
          ? { to: this.toDate }
          : {}),

        ...(this.selectedStageId
          ? {
              stageId:
                this.selectedStageId,
            }
          : {}),
      } as UsersExcelFilterDto;

    this.usersRequested.emit(
      filters,
    );
  }


  /* =========================
     ABSENTS
  ========================= */

  private emitAbsents(): void {

    const filters =
      {
        from: this.fromDate,
        to: this.toDate,

        ...(this.selectedStageId
          ? {
              stageId:
                this.selectedStageId,
            }
          : {}),
      } as AbsentStudentsExcelFilterDto;

    this.absentsRequested.emit(
      filters,
    );
  }


  /* =========================
     WITHOUT MEETINGS
  ========================= */

  private emitWithoutMeetings(): void {

    const filters =
      {
        from: this.fromDate,
        to: this.toDate,

        ...(this.selectedStageId
          ? {
              stageId:
                this.selectedStageId,
            }
          : {}),
      } as AbsentStudentsExcelFilterDto;

    this.withoutMeetingsRequested.emit(
      filters,
    );
  }


  /* =========================
     CLEAR
  ========================= */

  onClear(): void {

    this.fromDate = '';
    this.toDate = '';

    this.selectedStageId =
      null;
  }
}