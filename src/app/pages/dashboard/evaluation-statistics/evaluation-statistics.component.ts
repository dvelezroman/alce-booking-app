import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InstructorEvaluationService } from '../../../services/instructor-evaluation.service';
import {
  EvaluationStatisticsFilterDto,
  EvaluationStatisticsResponse
} from '../../../services/dtos/instructor-evaluation.dto';

import { MeetingEvaluationsFiltersComponent } from
  '../../../components/meeting-evaluations/meeting-evaluations-filters/meeting-evaluations-filters.component';

import { ModalComponent } from '../../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../../components/modal/modal.dto';
import { MeetingEvaluationStatisticsTableComponent } from
  '../../../components/meeting-evaluations/meeting-evaluation-statistics-table/meeting-evaluation-statistics-table.component';

@Component({
  selector: 'app-evaluation-statistics',
  standalone: true,
  imports: [
    CommonModule,
    MeetingEvaluationsFiltersComponent,
    ModalComponent,
    MeetingEvaluationStatisticsTableComponent
  ],
  templateUrl: './evaluation-statistics.component.html',
  styleUrl: './evaluation-statistics.component.scss'
})
export class EvaluationStatisticsComponent implements OnInit {

  // --------------------
  // DATA
  // --------------------
  statistics: EvaluationStatisticsResponse | null = null;

  // --------------------
  // UI STATE
  // --------------------
  searchAttempted = false;
  loading = false;

  modal: ModalDto = modalInitializer();

  constructor(
    private evaluationService: InstructorEvaluationService
  ) {}

  // --------------------
  // INIT → FETCH POR DEFECTO
  // --------------------
  ngOnInit(): void {
    const { from, to } = this.getDefaultDateRange();

    this.fetchStatistics({
      from,
      to
    });
  }

  private getDefaultDateRange(): { from: string; to: string } {
    const today = new Date();

    const to = today.toISOString().split('T')[0];

    const fromDate = new Date();
    fromDate.setDate(today.getDate() - 20);
    const from = fromDate.toISOString().split('T')[0];

    return { from, to };
  }

  // ----------------------------------
  // FILTROS DESDE HIJO
  // ----------------------------------
  onFiltersSubmitted(filters: EvaluationStatisticsFilterDto): void {

    if (!filters.from || !filters.to) {
      this.showAutoCloseModal(
        {
          isInfo: true,
          message: 'Debes seleccionar un rango de fechas'
        },
        3000
      );
      return;
    }

    this.fetchStatistics(filters);
  }

  // ----------------------------------
  // FETCH STATISTICS
  // ----------------------------------
  private fetchStatistics(filters: EvaluationStatisticsFilterDto): void {
    this.searchAttempted = true;
    this.loading = true;
    this.statistics = null;

    this.evaluationService.getEvaluationStatistics(filters).subscribe({
      next: (res) => {
        this.statistics = {
          ...res,
          instructors: [...res.instructors].sort(
            (a, b) => b.averageRating - a.averageRating
          )
        };
        this.loading = false;
      },
      error: () => {
        this.statistics = null;
        this.loading = false;
      }
    });
  }

  // ----------------------------------
  // MODAL AUXILIAR
  // ----------------------------------
  private showAutoCloseModal(
    config: Partial<ModalDto>,
    duration = 3000
  ) {
    this.modal = {
      ...modalInitializer(),
      ...config,
      show: true,
      close: () => {
        this.modal.show = false;
      }
    };

    setTimeout(() => {
      this.modal.show = false;
    }, duration);
  }
}