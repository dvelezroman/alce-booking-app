import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
  leadSchedulingKindLabel,
  leadSchedulingScheduleSummary,
  requestNotesPreview,
} from '../../../../shared/utils/lead-scheduling-request.util';

@Component({
  selector: 'app-admin-lead-scheduling-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-lead-scheduling-list.component.html',
  styleUrl: './admin-lead-scheduling-list.component.scss',
})
export class AdminLeadSchedulingListComponent implements OnInit {
  items: LeadSchedulingRequestRow[] = [];
  total = 0;
  loading = false;
  error: string | null = null;

  filterKind: '' | LeadSchedulingRequestKind = '';
  filterStatus: '' | LeadSchedulingRequestStatus = '';

  readonly pageSizeOptions = [10, 25, 50, 100] as const;
  pageSize = 25;
  /** Página actual (0-based). */
  pageIndex = 0;

  readonly kindLabel: Record<LeadSchedulingRequestKind, string> = {
    DEMO_CLASS: 'Demo / cortesía',
    PLACEMENT_EXAM: 'Examen ubicación',
  };

  readonly statusLabel: Record<LeadSchedulingRequestStatus, string> = {
    PENDING: 'Pendiente',
    SCHEDULED: 'Agendada',
    CANCELLED: 'Cancelada',
    COMPLETED: 'Completada',
  };

  constructor(
    private readonly leadScheduling: LeadSchedulingRequestService,
    private readonly route: ActivatedRoute,
    private readonly leadSchedulingPending: LeadSchedulingPendingCountService,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.applyKindFromRoute(params.get('kind'));
      this.pageIndex = 0;
      this.load();
    });
  }

  private applyKindFromRoute(kind: string | null): void {
    if (kind === 'PLACEMENT_EXAM' || kind === 'DEMO_CLASS') {
      this.filterKind = kind;
    }
  }

  get offset(): number {
    return this.pageIndex * this.pageSize;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  get canPrevPage(): boolean {
    return this.pageIndex > 0;
  }

  get canNextPage(): boolean {
    return (this.pageIndex + 1) * this.pageSize < this.total;
  }

  get rangeLabel(): string {
    if (this.total === 0) return '0 resultados';
    const from = this.offset + 1;
    const to = this.offset + this.items.length;
    return `${from}–${to} de ${this.total}`;
  }

  onFiltersChange(): void {
    this.pageIndex = 0;
    this.load();
  }

  onPageSizeChange(): void {
    this.pageIndex = 0;
    this.load();
  }

  prevPage(): void {
    if (!this.canPrevPage) return;
    this.pageIndex -= 1;
    this.load();
  }

  nextPage(): void {
    if (!this.canNextPage) return;
    this.pageIndex += 1;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.leadScheduling
      .listAdmin({
        limit: this.pageSize,
        offset: this.offset,
        kind: this.filterKind || undefined,
        status: this.filterStatus || undefined,
      })
      .subscribe({
        next: (res) => {
          this.items = res.items;
          this.total = res.total;
          if (this.offset >= this.total && this.total > 0) {
            this.pageIndex = 0;
            this.load();
            return;
          }
          this.loading = false;
          this.leadSchedulingPending.refresh(UserRole.ADMIN).subscribe();
        },
        error: (err) => {
          this.loading = false;
          this.error = getHttpErrorMessage(
            err,
            'No se pudo cargar el listado.',
          );
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
    const u = row.instructor?.user;
    if (!u) return '—';
    const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
    return name || u.email || `ID ${row.instructorId}`;
  }

  notesPreview(row: LeadSchedulingRequestRow): string | null {
    return requestNotesPreview(row.requestNotes);
  }
}
