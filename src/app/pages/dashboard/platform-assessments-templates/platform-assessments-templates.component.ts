import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PlatformAssessmentService } from '../../../services/platform-assessment.service';
import { RemoteTemplateItem } from '../../../services/dtos/platform-assessment.dto';

@Component({
  selector: 'app-platform-assessments-templates',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './platform-assessments-templates.component.html',
  styleUrls: ['./platform-assessments-templates.component.scss'],
})
export class PlatformAssessmentsTemplatesComponent implements OnInit {
  rows: RemoteTemplateItem[] = [];
  loading = false;
  errorMessage = '';

  total = 0;
  page = 1;
  pageSize = 20;

  search = '';
  stage: number | undefined;
  /** null = all; true/false filter */
  activeOnly: boolean | null = true;

  constructor(private platformAssessmentService: PlatformAssessmentService) {}

  ngOnInit(): void {
    this.fetch();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize) || 1);
  }

  applyFilters(): void {
    this.page = 1;
    this.fetch();
  }

  clearFilters(): void {
    this.search = '';
    this.stage = undefined;
    this.activeOnly = true;
    this.page = 1;
    this.fetch();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.page) return;
    this.page = page;
    this.fetch();
  }

  private fetch(): void {
    this.loading = true;
    this.errorMessage = '';
    this.platformAssessmentService
      .getTemplates({
        page: this.page,
        pageSize: this.pageSize,
        search: this.search.trim() || undefined,
        stage: this.stage,
        isActive: this.activeOnly === null ? undefined : this.activeOnly,
      })
      .subscribe({
        next: (res) => {
          this.rows = res.data ?? [];
          this.total = res.total ?? 0;
          this.page = res.page ?? this.page;
          this.pageSize = res.pageSize ?? this.pageSize;
          this.loading = false;
        },
        error: (err) => {
          this.rows = [];
          this.total = 0;
          this.loading = false;
          this.errorMessage =
            err?.error?.message ||
            err?.message ||
            'No se pudieron cargar los assessments.';
        },
      });
  }
}
