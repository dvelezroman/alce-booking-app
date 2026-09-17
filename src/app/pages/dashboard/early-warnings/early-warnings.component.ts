import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EarlyWarningsService } from '../../../services/early-warnings.service';
import { StagesService } from '../../../services/stages.service';
import {
  EarlyWarningAlertTypeFilter,
  EarlyWarningListResponseDto,
  EarlyWarningRowDto,
  EarlyWarningSummaryDto,
} from '../../../services/dtos/early-warnings.dto';
import { Stage } from '../../../services/dtos/student.dto';

@Component({
  selector: 'app-early-warnings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './early-warnings.component.html',
  styleUrl: './early-warnings.component.scss',
})
export class EarlyWarningsComponent implements OnInit {
  loading = false;
  summaryLoading = false;
  error: string | null = null;

  summary: EarlyWarningSummaryDto | null = null;
  list: EarlyWarningListResponseDto | null = null;
  stages: Stage[] = [];

  page = 1;
  limit = 20;
  alertType: EarlyWarningAlertTypeFilter = 'any';
  stageId: number | null = null;
  search = '';

  constructor(
    private readonly earlyWarnings: EarlyWarningsService,
    private readonly stagesService: StagesService,
  ) {}

  ngOnInit(): void {
    this.loadStages();
    this.loadSummary();
    this.loadList();
  }

  loadStages(): void {
    this.stagesService.getAll().subscribe({
      next: (stages) => {
        this.stages = stages ?? [];
      },
      error: () => {
        this.stages = [];
      },
    });
  }

  loadSummary(): void {
    this.summaryLoading = true;
    this.earlyWarnings.getSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
        this.summaryLoading = false;
      },
      error: () => {
        this.summaryLoading = false;
      },
    });
  }

  loadList(): void {
    this.loading = true;
    this.error = null;
    this.earlyWarnings
      .list({
        page: this.page,
        limit: this.limit,
        alertType: this.alertType,
        stageId: this.stageId ?? undefined,
        search: this.search || undefined,
      })
      .subscribe({
        next: (res) => {
          this.list = res;
          this.loading = false;
        },
        error: () => {
          this.error = 'No se pudo cargar el listado de alertas tempranas.';
          this.loading = false;
        },
      });
  }

  applyFilters(): void {
    this.page = 1;
    this.loadList();
    this.loadSummary();
  }

  clearFilters(): void {
    this.alertType = 'any';
    this.stageId = null;
    this.search = '';
    this.page = 1;
    this.loadList();
  }

  goToPage(page: number): void {
    if (page < 1) return;
    const totalPages = this.totalPages;
    if (page > totalPages) return;
    this.page = page;
    this.loadList();
  }

  get totalPages(): number {
    if (!this.list || this.list.limit <= 0) return 1;
    return Math.max(1, Math.ceil(this.list.totalCount / this.list.limit));
  }

  fullName(row: EarlyWarningRowDto): string {
    return `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() || '—';
  }

  email(row: EarlyWarningRowDto): string {
    return row.emailAddress || row.email || '—';
  }

  trackByStudentId(_index: number, row: EarlyWarningRowDto): number {
    return row.studentId;
  }
}
