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

@Component({
  selector: 'app-instructor-lead-scheduling-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './instructor-lead-scheduling-list.component.html',
  styleUrl: './instructor-lead-scheduling-list.component.scss',
})
export class InstructorLeadSchedulingListComponent implements OnInit {
  /** Filas acumuladas del API (según estado/tipo seleccionados en servidor). */
  sourceItems: LeadSchedulingRequestRow[] = [];
  /** Total de filas que reporta el API para el filtro servidor actual. */
  totalFromApi = 0;
  loading = false;
  error: string | null = null;

  /** Por defecto 25 registros por página (vista). */
  pageSize = 25;
  /** Índice de página base 0 sobre `filteredItems`. */
  pageIndex = 0;

  searchName = '';
  dateFrom = '';
  dateTo = '';
  /** Sesión agendada exactamente para el día calendario actual (fecha local). */
  sessionTodayOnly = false;
  statusFilter: '' | LeadSchedulingRequestStatus = '';
  kindFilter: '' | LeadSchedulingRequestKind = '';

  readonly pageSizeChoices: readonly number[] = [10, 25, 50, 100];

  private readonly fetchBatchSize = 100;
  private readonly fetchCap = 5000;

  readonly kindLabel: Record<LeadSchedulingRequestKind, string> = {
    DEMO_CLASS: 'Cortesía / demo',
    PLACEMENT_EXAM: 'Examen ubicación',
  };

  readonly statusLabel: Record<LeadSchedulingRequestStatus, string> = {
    PENDING: 'Pendiente',
    SCHEDULED: 'Agendada',
    CANCELLED: 'Cancelada',
    COMPLETED: 'Completada',
  };

  readonly statusOptions: { value: LeadSchedulingRequestStatus; label: string }[] = [
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'SCHEDULED', label: 'Agendada' },
    { value: 'COMPLETED', label: 'Completada' },
    { value: 'CANCELLED', label: 'Cancelada' },
  ];

  readonly kindOptions: { value: LeadSchedulingRequestKind; label: string }[] = [
    { value: 'DEMO_CLASS', label: 'Cortesía / demo' },
    { value: 'PLACEMENT_EXAM', label: 'Examen de ubicación' },
  ];

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
      this.kindFilter = kind;
    }
  }

  /** Descarga todas las filas disponibles para el filtro estado/tipo (en lotes), luego paginamos en cliente. */
  load(): void {
    this.loading = true;
    this.error = null;
    this.sourceItems = [];

    const acc: LeadSchedulingRequestRow[] = [];
    let reportedTotal = 0;

    const pull = (offset: number): void => {
      this.leadScheduling
        .listMine({
          limit: this.fetchBatchSize,
          offset,
          status: this.statusFilter || undefined,
          kind: this.kindFilter || undefined,
        })
        .subscribe({
          next: (res) => {
            reportedTotal = res.total;
            acc.push(...res.items);
            const got = res.items.length;
            const underTotal = acc.length < reportedTotal;
            const fullBatch = got === this.fetchBatchSize;
            const underCap = acc.length < this.fetchCap;
            if (underTotal && fullBatch && underCap && got > 0) {
              pull(offset + this.fetchBatchSize);
            } else {
              this.sourceItems = acc;
              this.totalFromApi = reportedTotal > 0 ? reportedTotal : acc.length;
              this.loading = false;
              this.clampPageIndex();
              this.leadSchedulingPending.refresh(UserRole.INSTRUCTOR).subscribe();
            }
          },
          error: (err) => {
            this.loading = false;
            this.error = getHttpErrorMessage(
              err,
              'No se pudo cargar la lista de solicitudes.',
            );
          },
        });
    };

    pull(0);
  }

  /** Filtros solo en cliente: nombre, email, fechas de sesión, «hoy». Estado/tipo ya vienen filtrados del servidor. */
  get filteredItems(): LeadSchedulingRequestRow[] {
    let list = [...this.sourceItems];

    const q = this.searchName.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        const full = `${r.firstName ?? ''} ${r.lastName ?? ''}`.toLowerCase().trim();
        const email = (r.email ?? '').toLowerCase();
        return full.includes(q) || email.includes(q);
      });
    }

    if (this.sessionTodayOnly) {
      const today = this.toYyyyMmDdLocal(new Date());
      list = list.filter((r) => this.scheduledYyyyMmDd(r) === today);
    } else {
      const from = this.dateFrom.trim();
      const to = this.dateTo.trim();
      if (from) {
        list = list.filter((r) => {
          const key = this.scheduledYyyyMmDd(r);
          return key !== '' && key >= from;
        });
      }
      if (to) {
        list = list.filter((r) => {
          const key = this.scheduledYyyyMmDd(r);
          return key !== '' && key <= to;
        });
      }
    }

    return list;
  }

  get pagedItems(): LeadSchedulingRequestRow[] {
    const start = this.pageIndex * this.pageSize;
    return this.filteredItems.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    const n = this.filteredItems.length;
    return Math.max(1, Math.ceil(n / this.pageSize));
  }

  get rangeLabel(): string {
    const n = this.filteredItems.length;
    if (n === 0) return '0 resultados';
    const start = this.pageIndex * this.pageSize + 1;
    const end = Math.min(n, (this.pageIndex + 1) * this.pageSize);
    return `${start}–${end} de ${n}`;
  }

  get hasActiveFilters(): boolean {
    return (
      this.searchName.trim() !== '' ||
      this.dateFrom.trim() !== '' ||
      this.dateTo.trim() !== '' ||
      this.sessionTodayOnly ||
      this.statusFilter !== '' ||
      this.kindFilter !== ''
    );
  }

  onServerFiltersChange(): void {
    this.pageIndex = 0;
    this.load();
  }

  onClientFiltersChange(): void {
    this.clampPageIndex();
  }

  onPageSizeChange(): void {
    this.pageIndex = 0;
    this.clampPageIndex();
  }

  goPrev(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
    }
  }

  goNext(): void {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
    }
  }

  goFirst(): void {
    this.pageIndex = 0;
  }

  goLast(): void {
    this.pageIndex = Math.max(0, this.totalPages - 1);
  }

  private clampPageIndex(): void {
    const maxIndex = Math.max(0, this.totalPages - 1);
    if (this.pageIndex > maxIndex) {
      this.pageIndex = maxIndex;
    }
  }

  toggleSessionToday(): void {
    this.sessionTodayOnly = !this.sessionTodayOnly;
    if (this.sessionTodayOnly) {
      this.dateFrom = '';
      this.dateTo = '';
    }
    this.onClientFiltersChange();
  }

  onDateRangeChange(): void {
    if (this.dateFrom || this.dateTo) {
      this.sessionTodayOnly = false;
    }
    this.onClientFiltersChange();
  }

  clearFilters(): void {
    this.searchName = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.sessionTodayOnly = false;
    this.statusFilter = '';
    this.kindFilter = '';
    this.pageIndex = 0;
    this.pageSize = 25;
    this.load();
  }

  kindText(k: LeadSchedulingRequestKind): string {
    return this.kindLabel[k] ?? k;
  }

  statusText(s: LeadSchedulingRequestStatus): string {
    return this.statusLabel[s] ?? s;
  }

  slotText(row: LeadSchedulingRequestRow): string {
    const d = row.scheduledDate;
    const h = row.scheduledHour;
    if (!d && h == null) return '—';
    const datePart = d ? new Date(this.normalizeDateForParse(d)).toLocaleDateString('es') : '—';
    const hourPart = h != null ? `${String(Math.floor(h)).padStart(2, '0')}:00` : '—';
    return `${datePart} · ${hourPart}`;
  }

  private scheduledYyyyMmDd(row: LeadSchedulingRequestRow): string {
    const raw = row.scheduledDate;
    if (!raw || typeof raw !== 'string') return '';
    return raw.length >= 10 ? raw.slice(0, 10) : raw;
  }

  private toYyyyMmDdLocal(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private normalizeDateForParse(iso: string): string {
    if (iso.includes('T') || iso.endsWith('Z')) return iso;
    return `${iso}T12:00:00`;
  }
}
