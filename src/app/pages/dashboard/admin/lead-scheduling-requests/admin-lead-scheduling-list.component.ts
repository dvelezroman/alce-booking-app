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


/* =========================
   CHILD COMPONENTS
========================= */

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

  /* =========================
     DATA
  ========================= */

  items: LeadSchedulingRequestRow[] = [];
  total = 0;

  loading = false;
  error: string | null = null;


  /* =========================
     FILTERS
  ========================= */

  filterKind: '' | LeadSchedulingRequestKind = '';
  filterStatus: '' | LeadSchedulingRequestStatus = '';


  /* =========================
     PAGINATION
  ========================= */

  readonly pageSizeOptions = [10, 25, 50, 100] as const;

  pageSize = 25;

  /**
   * Página actual interna.
   * 0-based para trabajar directamente con offset.
   */
  pageIndex = 0;


  /* =========================
     LABELS
  ========================= */

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


  /* =========================
     CONSTRUCTOR
  ========================= */

  constructor(
    private readonly leadScheduling: LeadSchedulingRequestService,
    private readonly route: ActivatedRoute,
    private readonly leadSchedulingPending: LeadSchedulingPendingCountService,
  ) {}


  /* =========================
     INIT
  ========================= */

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.applyKindFromRoute(params.get('kind'));
      this.pageIndex = 0;
      this.load();
    });
  }


  /* =========================
     ROUTE FILTER
  ========================= */

  private applyKindFromRoute(kind: string | null): void {
    if (kind === 'PLACEMENT_EXAM' || kind === 'DEMO_CLASS') {
      this.filterKind = kind;
    }
  }


  /* =========================
     PAGINATION GETTERS
  ========================= */

  get offset(): number {
    return this.pageIndex * this.pageSize;
  }


  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.total / this.pageSize),
    );
  }


  /**
   * Página actual para mostrar en UI.
   * 1-based.
   */
  get currentPage(): number {
    return this.pageIndex + 1;
  }


  get canPrevPage(): boolean {
    return this.pageIndex > 0;
  }


  get canNextPage(): boolean {
    return (
      (this.pageIndex + 1) * this.pageSize <
      this.total
    );
  }


  get rangeLabel(): string {
    if (this.total === 0) {
      return '0 resultados';
    }

    const from = this.offset + 1;
    const to = this.offset + this.items.length;

    return `${from}–${to} de ${this.total}`;
  }


  /**
   * Primera posición que se está mostrando.
   * Útil para el hijo de paginación.
   */
  get resultsStart(): number {
    if (this.total === 0) {
      return 0;
    }

    return this.offset + 1;
  }


  /**
   * Última posición visible.
   */
  get resultsEnd(): number {
    if (this.total === 0) {
      return 0;
    }

    return Math.min(
      this.offset + this.items.length,
      this.total,
    );
  }


  /* =========================
     FILTERS
  ========================= */

  onFiltersChange(): void {
    this.pageIndex = 0;
    this.load();
  }


  /**
   * Permite que el hijo cambie directamente
   * el tipo de solicitud.
   */
  onKindChange(
    kind: '' | LeadSchedulingRequestKind,
  ): void {
    this.filterKind = kind;
    this.onFiltersChange();
  }


  /**
   * Permite que el hijo cambie directamente
   * el estado.
   */
  onStatusChange(
    status: '' | LeadSchedulingRequestStatus,
  ): void {
    this.filterStatus = status;
    this.onFiltersChange();
  }


  /**
   * Limpia ambos filtros.
   */
  clearFilters(): void {
    this.filterKind = '';
    this.filterStatus = '';
    this.pageIndex = 0;

    this.load();
  }


  /* =========================
     PAGE SIZE
  ========================= */

  onPageSizeChange(): void {
    this.pageIndex = 0;
    this.load();
  }


  /**
   * Diseñado para recibir el pageSize
   * emitido desde el hijo.
   */
  changePageSize(
    pageSize: number,
  ): void {
    if (
      !this.pageSizeOptions.includes(
        pageSize as 10 | 25 | 50 | 100,
      )
    ) {
      return;
    }

    this.pageSize = pageSize;
    this.pageIndex = 0;

    this.load();
  }


  /* =========================
     PREVIOUS PAGE
  ========================= */

  prevPage(): void {
    if (!this.canPrevPage) {
      return;
    }

    this.pageIndex -= 1;

    this.load();
  }


  /* =========================
     NEXT PAGE
  ========================= */

  nextPage(): void {
    if (!this.canNextPage) {
      return;
    }

    this.pageIndex += 1;

    this.load();
  }


  /* =========================
     CHANGE PAGE
  ========================= */

  /**
   * Recibe páginas 1-based desde el hijo.
   *
   * Ej:
   * 1 → pageIndex 0
   * 2 → pageIndex 1
   * 3 → pageIndex 2
   */
  changePage(
    page: number,
  ): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.pageIndex = page - 1;

    this.load();
  }


  /* =========================
     FIRST PAGE
  ========================= */

  firstPage(): void {
    if (!this.canPrevPage) {
      return;
    }

    this.pageIndex = 0;

    this.load();
  }


  /* =========================
     LAST PAGE
  ========================= */

  lastPage(): void {
    if (!this.canNextPage) {
      return;
    }

    this.pageIndex =
      Math.max(
        0,
        this.totalPages - 1,
      );

    this.load();
  }


  /* =========================
     REFRESH
  ========================= */

  refresh(): void {
    this.load();
  }


  /* =========================
     LOAD
  ========================= */

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

          if (
            this.offset >= this.total &&
            this.total > 0
          ) {
            this.pageIndex = 0;
            this.load();
            return;
          }

          this.loading = false;

          this.leadSchedulingPending
            .refresh(UserRole.ADMIN)
            .subscribe();
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


  /* =========================
     KIND
  ========================= */

  kindText(
    row: LeadSchedulingRequestRow,
  ): string {
    return leadSchedulingKindLabel(row);
  }


  /* =========================
     STATUS
  ========================= */

  statusText(
    s: LeadSchedulingRequestStatus,
  ): string {
    return this.statusLabel[s] ?? s;
  }


  /* =========================
     SCHEDULE
  ========================= */

  slotText(
    row: LeadSchedulingRequestRow,
  ): string {
    return leadSchedulingScheduleSummary(row);
  }


  /* =========================
     INSTRUCTOR
  ========================= */

  instructorLabel(
    row: LeadSchedulingRequestRow,
  ): string {
    const u = row.instructor?.user;

    if (!u) {
      return '—';
    }

    const name =
      `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();

    return (
      name ||
      u.email ||
      `ID ${row.instructorId}`
    );
  }


  /* =========================
     NOTES
  ========================= */

  notesPreview(
    row: LeadSchedulingRequestRow,
  ): string | null {
    return requestNotesPreview(
      row.requestNotes,
    );
  }
}