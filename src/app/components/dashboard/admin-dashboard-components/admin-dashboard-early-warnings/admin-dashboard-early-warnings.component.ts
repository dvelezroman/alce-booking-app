import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EarlyWarningsService } from '../../../../services/early-warnings.service';
import {
  EarlyWarningRowDto,
  EarlyWarningSummaryDto,
} from '../../../../services/dtos/early-warnings.dto';

@Component({
  selector: 'app-admin-dashboard-early-warnings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard-early-warnings.component.html',
  styleUrl: './admin-dashboard-early-warnings.component.scss',
})
export class AdminDashboardEarlyWarningsComponent implements OnInit {
  loading = false;
  summary: EarlyWarningSummaryDto | null = null;

  constructor(private readonly earlyWarnings: EarlyWarningsService) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.earlyWarnings.getSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
        this.loading = false;
      },
      error: () => {
        this.summary = null;
        this.loading = false;
      },
    });
  }

  fullName(row: EarlyWarningRowDto): string {
    return `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() || '—';
  }

  trackByStudentId(_index: number, row: EarlyWarningRowDto): number {
    return row.studentId;
  }
}
