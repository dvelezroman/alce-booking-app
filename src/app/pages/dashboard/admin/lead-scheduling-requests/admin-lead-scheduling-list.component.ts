import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { LeadSchedulingRequestService } from '../../../../services/lead-scheduling-request.service';
import { LeadSchedulingPendingCountService } from '../../../../services/lead-scheduling-pending-count.service';

import { UserRole } from '../../../../services/dtos/user.dto';

import {
  LeadSchedulingRequestKind,
  LeadSchedulingRequestRow,
  LeadSchedulingRequestStatus,
} from '../../../../services/dtos/lead-scheduling-request.dto';

import { getHttpErrorMessage } from '../../../../shared/utils/http-error-message.util';

import {
  LEAD_SCHEDULING_DEFAULT_PAGE_SIZE,
  LEAD_SCHEDULING_PAGE_SIZE_OPTIONS,
  leadSchedulingKindLabel,
  leadSchedulingScheduleSummary,
  requestNotesPreview,
  type LeadSchedulingDateField,
  type LeadSchedulingListSortBy,
} from '../../../../shared/utils/lead-scheduling-request.util';

import { AdminLeadSchedulingHeaderComponent } from '../../../../components/admin-lead-scheduling-request/admin-lead-scheduling-header/admin-lead-scheduling-header.component';

import { AdminLeadSchedulingFiltersComponent } from '../../../../components/admin-lead-scheduling-request/admin-lead-scheduling-filters/admin-lead-scheduling-filters.component';

import { AdminLeadSchedulingTableComponent } from '../../../../components/admin-lead-scheduling-request/admin-lead-scheduling-table/admin-lead-scheduling-table.component';

import { AdminLeadSchedulingPaginationComponent } from '../../../../components/admin-lead-scheduling-request/admin-lead-scheduling-pagination/admin-lead-scheduling-pagination.component';

@Component({
  selector: 'app-admin-lead-scheduling-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    AdminLeadSchedulingHeaderComponent,
    AdminLeadSchedulingFiltersComponent,
    AdminLeadSchedulingTableComponent,
    AdminLeadSchedulingPaginationComponent,
  ],
  templateUrl: './admin-lead-scheduling-list.component.html',
  styleUrl: './admin-lead-scheduling-list.component.scss',
})
export class AdminLeadSchedulingListComponent implements OnInit {
  items: LeadSchedulingRequestRow[] = [];
  total = 0;

  loading = false;
  error: string | null = null;

  filterKind: '' | LeadSchedulingRequestKind = '';
  filterStatus: '' | LeadSchedulingRequestStatus = 'PENDING';
  sortBy: LeadSchedulingListSortBy = 'createdAt';
  dateField: LeadSchedulingDateField = 'created';
  dateFrom = '';
  dateTo = '';

  readonly pageSizeOptions = LEAD_SCHEDULING_PAGE_SIZE_OPTIONS;
  pageSize = LEAD_SCHEDULING_DEFAULT_PAGE_SIZE;
  pageIndex = 0;

  readonly kindLabel: Record<LeadSchedulingRequestKind, string> = {
    DEMO_CLASS: 'Demo / cortesía',
    PLACEMENT_EXAM: 'Examen ubicación',
    INDUCTION: 'Inducción',
  };

  readonly statusLabel: Record<LeadSchedulingRequestStatus, string> = {
    PENDING: 'Pendiente',
    SCHEDULED: 'Agendada',
    CANCELLED: 'Cancelada',
    COMPLETED: 'Completada',
  };

  private applyingRoute = false;
  private skipNextRouteApply = false;

  constructor(
    private readonly leadScheduling: LeadSchedulingRequestService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly leadSchedulingPending: LeadSchedulingPendingCountService,
  ) {}

  ngOnInit(): void {
    this.applyFiltersFromRoute(this.route.snapshot.queryParamMap);
    this.load();

    this.route.queryParamMap.subscribe((params) => {
      if (this.skipNextRouteApply) {
        this.skipNextRouteApply = false;
        return;
      }
      this.applyingRoute = true;
      this.applyFiltersFromRoute(params);
      this.applyingRoute = false;
      this.load();
    });
  }

  private applyFiltersFromRoute(params: {
    get(name: string): string | null;
  }): void {
    const kind = params.get('kind');
    if (
      kind === 'PLACEMENT_EXAM' ||
      kind === 'DEMO_CLASS' ||
      kind === 'INDUCTION'
    ) {
      this.filterKind = kind;
    }

    const status = params.get('status');
    if (
      status === 'PENDING' ||
      status === 'SCHEDULED' ||
      status === 'CANCELLED' ||
      status === 'COMPLETED'
    ) {
      this.filterStatus = status;
    } else if (status === '') {
      this.filterStatus = '';
    }

    const sortBy = params.get('sortBy');
    if (sortBy === 'createdAt' || sortBy === 'scheduledSession') {
      this.sortBy = sortBy;
    }

    const dateField = params.get('dateField');
    if (dateField === 'created' || dateField === 'session') {
      this.dateField = dateField;
    }

    if (params.get('dateFrom') != null) {
      this.dateFrom = params.get('dateFrom') ?? '';
    }
    if (params.get('dateTo') != null) {
      this.dateTo = params.get('dateTo') ?? '';
    }

    const limitRaw = params.get('limit');
    if (limitRaw) {
      const limit = Number(limitRaw);
      if (
        (this.pageSizeOptions as readonly number[]).includes(limit)
      ) {
        this.pageSize = limit;
      }
    }

    const pageRaw = params.get('page');
    if (pageRaw) {
      const page = Number(pageRaw);
      if (Number.isFinite(page) && page >= 1) {
        this.pageIndex = page - 1;
      }
    } else {
      this.pageIndex = 0;
    }
  }

  private syncQueryParams(): void {
    if (this.applyingRoute) return;
    this.skipNextRouteApply = true;

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        kind: this.filterKind || null,
        status: this.filterStatus || null,
        sortBy: this.sortBy !== 'createdAt' ? this.sortBy : null,
        dateField:
          this.dateFrom || this.dateTo ? this.dateField : null,
        dateFrom: this.dateFrom || null,
        dateTo: this.dateTo || null,
        limit:
          this.pageSize !== LEAD_SCHEDULING_DEFAULT_PAGE_SIZE
            ? this.pageSize
            : null,
        page: this.pageIndex > 0 ? this.pageIndex + 1 : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  get offset(): number {
    return this.pageIndex * this.pageSize;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  get currentPage(): number {
    return this.pageIndex + 1;
  }

  get canPrevPage(): boolean {
    return this.pageIndex > 0;
  }

  get canNextPage(): boolean {
    return (this.pageIndex + 1) * this.pageSize < this.total;
  }

  get rangeLabel(): string {
    if (this.total === 0) {
      return '0 resultados';
    }

    const from = this.offset + 1;
    const to = this.offset + this.items.length;

    return `${from}–${to} de ${this.total}`;
  }

  get resultsStart(): number {
    if (this.total === 0) {
      return 0;
    }
    return this.offset + 1;
  }

  get resultsEnd(): number {
    if (this.total === 0) {
      return 0;
    }
    return Math.min(this.offset + this.items.length, this.total);
  }

  onFiltersChange(): void {
    this.pageIndex = 0;
    this.syncQueryParams();
    this.load();
  }

  onKindChange(kind: '' | LeadSchedulingRequestKind): void {
    this.filterKind = kind;
    this.onFiltersChange();
  }

  onStatusChange(status: '' | LeadSchedulingRequestStatus): void {
    this.filterStatus = status;
    this.onFiltersChange();
  }

  onSortByChange(sortBy: LeadSchedulingListSortBy): void {
    this.sortBy = sortBy;
    this.onFiltersChange();
  }

  onDateFieldChange(dateField: LeadSchedulingDateField): void {
    this.dateField = dateField;
    if (this.dateFrom || this.dateTo) {
      this.onFiltersChange();
    }
  }

  onDateFromChange(value: string): void {
    this.dateFrom = value;
    this.onFiltersChange();
  }

  onDateToChange(value: string): void {
    this.dateTo = value;
    this.onFiltersChange();
  }

  clearFilters(): void {
    this.filterKind = '';
    this.filterStatus = 'PENDING';
    this.sortBy = 'createdAt';
    this.dateField = 'created';
    this.dateFrom = '';
    this.dateTo = '';
    this.pageIndex = 0;
    this.syncQueryParams();
    this.load();
  }

  changePageSize(pageSize: number): void {
    if (!(this.pageSizeOptions as readonly number[]).includes(pageSize)) {
      return;
    }

    this.pageSize = pageSize;
    this.pageIndex = 0;
    this.syncQueryParams();
    this.load();
  }

  prevPage(): void {
    if (!this.canPrevPage) return;
    this.pageIndex -= 1;
    this.syncQueryParams();
    this.load();
  }

  nextPage(): void {
    if (!this.canNextPage) return;
    this.pageIndex += 1;
    this.syncQueryParams();
    this.load();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.pageIndex = page - 1;
    this.syncQueryParams();
    this.load();
  }

  firstPage(): void {
    if (!this.canPrevPage) return;
    this.pageIndex = 0;
    this.syncQueryParams();
    this.load();
  }

  lastPage(): void {
    if (!this.canNextPage) return;
    this.pageIndex = Math.max(0, this.totalPages - 1);
    this.syncQueryParams();
    this.load();
  }

  refresh(): void {
    this.load();
  }

  private buildListQuery() {
    const dateParams =
      this.dateField === 'session'
        ? {
            scheduledFrom: this.dateFrom || undefined,
            scheduledTo: this.dateTo || undefined,
          }
        : {
            createdFrom: this.dateFrom || undefined,
            createdTo: this.dateTo || undefined,
          };

    return {
      limit: this.pageSize,
      offset: this.offset,
      kind: this.filterKind || undefined,
      status: this.filterStatus || undefined,
      sortBy: this.sortBy,
      sortDir: 'desc' as const,
      ...dateParams,
    };
  }

  load(): void {
    this.loading = true;
    this.error = null;

    this.leadScheduling.listAdmin(this.buildListQuery()).subscribe({
      next: (res) => {
        this.items = res.items;
        this.total = res.total;

        if (this.offset >= this.total && this.total > 0) {
          this.pageIndex = 0;
          this.syncQueryParams();
          this.load();
          return;
        }

        this.loading = false;
        this.leadSchedulingPending.refresh(UserRole.ADMIN).subscribe();
      },
      error: (err) => {
        this.loading = false;
        this.error = getHttpErrorMessage(err, 'No se pudo cargar el listado.');
      },
    });
  }

  kindText(row: LeadSchedulingRequestRow): string {
    return leadSchedulingKindLabel(row);
  }

  statusText(s: LeadSchedulingRequestStatus): string {
    return this.statusLabel[s] ?? s;
  }

  slotText(row: LeadSchedulingRequestRow): string {
    return leadSchedulingScheduleSummary(row);
  }

  instructorLabel(row: LeadSchedulingRequestRow): string {
    if (row.kind === 'INDUCTION') {
      const admin = row.responsibleAdmin;
      if (!admin) return '—';
      const name = `${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim();
      return name || admin.email || `ID ${row.responsibleAdminId}`;
    }

    const u = row.instructor?.user;
    if (!u) return '—';
    const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
    return name || u.email || `ID ${row.instructorId}`;
  }

  notesPreview(row: LeadSchedulingRequestRow): string | null {
    return requestNotesPreview(row.requestNotes);
  }
}
