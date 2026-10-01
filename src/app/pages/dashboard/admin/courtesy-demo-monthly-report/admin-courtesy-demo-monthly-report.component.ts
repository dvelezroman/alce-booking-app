import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LeadSchedulingRequestService } from '../../../../services/lead-scheduling-request.service';
import {
  COURTESY_DEMO_OUTCOME_LABEL,
  type CourtesyDemoMonthlyInstructorTotals,
  type CourtesyDemoMonthlyReportResponse,
  type CourtesyDemoMonthlyReportRow,
  type CourtesyDemoMonthlyReportSummary,
} from '../../../../services/dtos/courtesy-demo-monthly-report.dto';
import { getHttpErrorMessage } from '../../../../shared/utils/http-error-message.util';

@Component({
  selector: 'app-admin-courtesy-demo-monthly-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-courtesy-demo-monthly-report.component.html',
  styleUrl: './admin-courtesy-demo-monthly-report.component.scss',
})
export class AdminCourtesyDemoMonthlyReportComponent implements OnInit {
  readonly outcomeLabel = COURTESY_DEMO_OUTCOME_LABEL;

  year = signal(new Date().getFullYear());
  month = signal(new Date().getMonth() + 1);
  instructorFilter = signal<string>('all');
  officeFilter = signal<string>('all');

  loading = signal(false);
  error = signal<string | null>(null);
  data = signal<CourtesyDemoMonthlyReportResponse | null>(null);

  summary = computed(
    (): CourtesyDemoMonthlyReportSummary | null =>
      this.data()?.summary ?? null,
  );

  instructorOptions = computed((): CourtesyDemoMonthlyInstructorTotals[] => {
    const list = this.data()?.byInstructor ?? [];
    return [...list].sort((a, b) =>
      (a.instructorName ?? '').localeCompare(b.instructorName ?? '', 'es'),
    );
  });

  officeOptions = computed((): string[] => {
    const rows = this.data()?.rows ?? [];
    const set = new Set<string>();
    for (const r of rows) {
      const o = r.requestingAdvisorOfficeLabel?.trim();
      if (o) set.add(o);
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'es'));
  });

  filteredRows = computed((): CourtesyDemoMonthlyReportRow[] => {
    return this.data()?.rows ?? [];
  });

  ngOnInit(): void {
    void this.loadReport();
  }

  onPeriodChange(): void {
    void this.loadReport();
  }

  onInstructorChange(value: string): void {
    this.instructorFilter.set(value);
    void this.loadReport();
  }

  onOfficeChange(value: string): void {
    this.officeFilter.set(value);
    void this.loadReport();
  }

  formatSlot(row: CourtesyDemoMonthlyReportRow): string {
    if (!row.scheduledDateYmd) return '—';
    const h =
      row.scheduledHour != null && row.scheduledHour >= 0 && row.scheduledHour <= 23
        ? `${String(row.scheduledHour).padStart(2, '0')}:00`
        : '—';
    return `${row.scheduledDateYmd} ${h}`;
  }

  formatRate(rate: number | null): string {
    if (rate == null) return '—';
    return `${rate}%`;
  }

  private buildQuery(): {
    year: number;
    month: number;
    instructorId?: number;
    advisorOfficeLabel?: string;
  } {
    const q: {
      year: number;
      month: number;
      instructorId?: number;
      advisorOfficeLabel?: string;
    } = {
      year: this.year(),
      month: this.month(),
    };
    const inst = this.instructorFilter();
    if (inst !== 'all') {
      const n = parseInt(inst, 10);
      if (Number.isFinite(n)) q.instructorId = n;
    }
    const office = this.officeFilter();
    if (office !== 'all' && office.trim()) {
      q.advisorOfficeLabel = office.trim();
    }
    return q;
  }

  loadReport(): void {
    this.loading.set(true);
    this.error.set(null);
    this.leadScheduling.getCourtesyMonthlyReport(this.buildQuery()).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.data.set(null);
        this.loading.set(false);
        this.error.set(getHttpErrorMessage(err, 'No se pudo cargar el reporte'));
      },
    });
  }

  constructor(
    private readonly leadScheduling: LeadSchedulingRequestService,
  ) {}
}
