import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { InstructorSchedulingRequestHeaderComponent } from '../../../../components/instructor-scheduling-request/instructor-scheduling-request-header/instructor-scheduling-request-header.component';
import { InstructorSchedulingRequestFiltersComponent } from '../../../../components/instructor-scheduling-request/instructor-scheduling-request-filters/instructor-scheduling-request-filters.component';
import { InstructorSchedulingRequestSummaryComponent } from '../../../../components/instructor-scheduling-request/instructor-scheduling-request-summary/instructor-scheduling-request-summary.component';
import { InstructorSchedulingRequestListComponent } from '../../../../components/instructor-scheduling-request/instructor-scheduling-request-list/instructor-scheduling-request-list.component';
import { InstructorSchedulingRequestPaginationComponent } from '../../../../components/instructor-scheduling-request/instructor-scheduling-request-pagination/instructor-scheduling-request-pagination.component';

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

export type InstructorSchedulingQueue = 'pending' | 'report' | 'all';

@Component({
  selector: 'app-instructor-lead-scheduling-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    InstructorSchedulingRequestHeaderComponent,
    InstructorSchedulingRequestFiltersComponent,
    InstructorSchedulingRequestSummaryComponent,
    InstructorSchedulingRequestListComponent,
    InstructorSchedulingRequestPaginationComponent,
  ],
  templateUrl: './instructor-lead-scheduling-list.component.html',
  styleUrl: './instructor-lead-scheduling-list.component.scss',
})
export class InstructorLeadSchedulingListComponent implements OnInit {
  items: LeadSchedulingRequestRow[] = [];
  total = 0;

  loading = false;
  error: string | null = null;

  pageSize = LEAD_SCHEDULING_DEFAULT_PAGE_SIZE;
  pageIndex = 0;

  searchName = '';
  dateFrom = '';
  dateTo = '';
  sessionTodayOnly = false;
  sortBy: LeadSchedulingListSortBy = 'createdAt';
  dateField: LeadSchedulingDateField = 'session';

  /** Work queue tabs: pending assignment vs report due. */
  activeQueue: InstructorSchedulingQueue = 'pending';

  statusFilter: '' | LeadSchedulingRequestStatus = 'PENDING';
  kindFilter: '' | LeadSchedulingRequestKind = '';

  pendingAssignmentCount = 0;
  scheduledReportPendingCount = 0;

  readonly pageSizeChoices = LEAD_SCHEDULING_PAGE_SIZE_OPTIONS;

  readonly statusLabel: Record<LeadSchedulingRequestStatus, string> = {
    PENDING: 'Pendiente',
    SCHEDULED: 'Agendada',
    CANCELLED: 'Cancelada',
    COMPLETED: 'Completada',
  };

  constructor(
    private readonly leadScheduling: LeadSchedulingRequestService,
    private readonly route: ActivatedRoute,
    private router: Router,
    private readonly leadSchedulingPending: LeadSchedulingPendingCountService,
  ) {}

  ngOnInit(): void {
    this.leadSchedulingPending.instructorPendingAssignmentCount$.subscribe(
      (count) => (this.pendingAssignmentCount = count),
    );
    this.leadSchedulingPending.instructorScheduledReportPendingCount$.subscribe(
      (count) => {
        this.scheduledReportPendingCount = count;
        if (this.activeQueue === 'report' && !this.kindFilter) {
          this.total = count;
        }
      },
    );

    this.route.queryParamMap.subscribe((params) => {
      this.applyKindFromRoute(params.get('kind'));
      this.applyQueueFromRoute(params.get('queue'), params.get('status'));
      this.pageIndex = 0;
      this.load();
    });
  }

  private applyQueueFromRoute(
    queue: string | null,
    status: string | null,
  ): void {
    if (queue === 'pending' || queue === 'report' || queue === 'all') {
      this.setQueue(queue, false);
      return;
    }

    if (
      status === 'PENDING' ||
      status === 'SCHEDULED' ||
      status === 'CANCELLED' ||
      status === 'COMPLETED'
    ) {
      this.statusFilter = status;
      if (status === 'PENDING') {
        this.activeQueue = 'pending';
      } else if (status === 'SCHEDULED') {
        this.activeQueue = 'report';
      } else {
        this.activeQueue = 'all';
      }
      return;
    }

    this.setQueue('pending', false);
  }

  setQueue(
    queue: InstructorSchedulingQueue,
    syncUrl = true,
  ): void {
    this.activeQueue = queue;
    if (queue === 'pending') {
      this.statusFilter = 'PENDING';
    } else if (queue === 'report') {
      this.statusFilter = 'SCHEDULED';
    } else {
      this.statusFilter = '';
    }

    if (syncUrl) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          queue: queue === 'all' ? null : queue,
          status: null,
        },
        queryParamsHandling: 'merge',
      });
    }
  }

  private applyKindFromRoute(kind: string | null): void {
    if (
      kind === 'PLACEMENT_EXAM' ||
      kind === 'DEMO_CLASS' ||
      kind === 'INDUCTION'
    ) {
      this.kindFilter = kind;
    }
  }

  private toYyyyMmDdLocal(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private buildListQuery() {
    let scheduledFrom: string | undefined;
    let scheduledTo: string | undefined;
    let createdFrom: string | undefined;
    let createdTo: string | undefined;

    if (this.sessionTodayOnly) {
      const today = this.toYyyyMmDdLocal(new Date());
      scheduledFrom = today;
      scheduledTo = today;
    } else if (this.dateFrom || this.dateTo) {
      if (this.dateField === 'created') {
        createdFrom = this.dateFrom || undefined;
        createdTo = this.dateTo || undefined;
      } else {
        scheduledFrom = this.dateFrom || undefined;
        scheduledTo = this.dateTo || undefined;
      }
    }

    return {
      limit: this.pageSize,
      offset: this.pageIndex * this.pageSize,
      status: this.statusFilter || undefined,
      kind: this.kindFilter || undefined,
      sortBy: this.sortBy,
      sortDir: 'desc' as const,
      createdFrom,
      createdTo,
      scheduledFrom,
      scheduledTo,
    };
  }

  load(): void {
    this.loading = true;
    this.error = null;

    this.leadScheduling.listMine(this.buildListQuery()).subscribe({
      next: (res) => {
        let rows = res.items;
        if (this.activeQueue === 'report') {
          rows = rows.filter((row) => !row.instructorReportSubmittedAt);
        }
        this.items = rows;
        if (this.activeQueue === 'report' && !this.kindFilter) {
          this.total = this.scheduledReportPendingCount || rows.length;
        } else {
          this.total = res.total;
        }
        this.loading = false;
        this.clampPageIndex();
        this.leadSchedulingPending.refresh(UserRole.INSTRUCTOR).subscribe();
      },
      error: (err) => {
        this.loading = false;
        this.error = getHttpErrorMessage(
          err,
          'No se pudo cargar la lista de solicitudes.',
        );
      },
    });
  }

  /** Client search on current page only. */
  get filteredItems(): LeadSchedulingRequestRow[] {
    const q = this.searchName.trim().toLowerCase();
    if (!q) return this.items;

    return this.items.filter((r) => {
      const full = `${r.firstName ?? ''} ${r.lastName ?? ''}`
        .toLowerCase()
        .trim();
      const email = (r.email ?? '').toLowerCase();
      return full.includes(q) || email.includes(q);
    });
  }

  get pagedItems(): LeadSchedulingRequestRow[] {
    return this.filteredItems;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  get rangeLabel(): string {
    if (this.total === 0) return '0 resultados';
    const start = this.pageIndex * this.pageSize + 1;
    const end = Math.min(this.total, this.pageIndex * this.pageSize + this.items.length);
    return `${start}–${end} de ${this.total}`;
  }

  get hasActiveFilters(): boolean {
    return (
      this.searchName.trim() !== '' ||
      this.dateFrom.trim() !== '' ||
      this.dateTo.trim() !== '' ||
      this.sessionTodayOnly ||
      this.statusFilter !== 'PENDING' ||
      this.kindFilter !== '' ||
      this.sortBy !== 'createdAt'
    );
  }

  onServerFiltersChange(): void {
    if (this.statusFilter === 'PENDING') {
      this.activeQueue = 'pending';
    } else if (this.statusFilter === 'SCHEDULED') {
      this.activeQueue = 'report';
    } else {
      this.activeQueue = 'all';
    }
    this.pageIndex = 0;
    this.load();
  }

  onClientFiltersChange(): void {
    // search is client-only on current page
  }

  onPageSizeChange(): void {
    this.pageIndex = 0;
    this.load();
  }

  goPrev(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.load();
    }
  }

  goNext(): void {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.load();
    }
  }

  goFirst(): void {
    this.pageIndex = 0;
    this.load();
  }

  goLast(): void {
    this.pageIndex = Math.max(0, this.totalPages - 1);
    this.load();
  }

  private clampPageIndex(): void {
    const maxIndex = Math.max(0, this.totalPages - 1);
    if (this.pageIndex > maxIndex) {
      this.pageIndex = maxIndex;
      if (this.total > 0) this.load();
    }
  }

  toggleSessionToday(): void {
    this.sessionTodayOnly = !this.sessionTodayOnly;
    if (this.sessionTodayOnly) {
      this.dateFrom = '';
      this.dateTo = '';
      this.dateField = 'session';
    }
    this.onServerFiltersChange();
  }

  onDateRangeChange(): void {
    if (this.dateFrom || this.dateTo) {
      this.sessionTodayOnly = false;
    }
    this.onServerFiltersChange();
  }

  clearFilters(): void {
    this.searchName = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.sessionTodayOnly = false;
    this.kindFilter = '';
    this.sortBy = 'createdAt';
    this.dateField = 'session';
    this.pageIndex = 0;
    if (this.activeQueue === 'pending') {
      this.statusFilter = 'PENDING';
      this.load();
      return;
    }
    this.setQueue('pending', true);
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

  notesPreview(row: LeadSchedulingRequestRow): string | null {
    return requestNotesPreview(row.requestNotes, 56);
  }

  goToRequestDetail(requestId: number): void {
    this.router.navigate([
      '/dashboard/instructor/lead-scheduling-requests',
      requestId,
    ]);
  }
}
