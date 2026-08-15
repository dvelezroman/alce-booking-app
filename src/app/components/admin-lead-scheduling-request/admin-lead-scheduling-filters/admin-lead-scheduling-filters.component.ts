import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  FormsModule,
} from '@angular/forms';

import {
  LeadSchedulingRequestKind,
  LeadSchedulingRequestStatus,
} from '../../../services/dtos/lead-scheduling-request.dto';

@Component({
  selector: 'app-admin-lead-scheduling-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './admin-lead-scheduling-filters.component.html',
  styleUrl: './admin-lead-scheduling-filters.component.scss',
})
export class AdminLeadSchedulingFiltersComponent {

  /* =========================
     INPUTS
  ========================= */

  @Input()
  filterKind: '' | LeadSchedulingRequestKind = '';

  @Input()
  filterStatus: '' | LeadSchedulingRequestStatus = '';

  @Input()
  loading = false;


  /* =========================
     OUTPUTS
  ========================= */

  @Output()
  kindChange =
    new EventEmitter<'' | LeadSchedulingRequestKind>();

  @Output()
  statusChange =
    new EventEmitter<'' | LeadSchedulingRequestStatus>();

  @Output()
  clearRequested =
    new EventEmitter<void>();

  @Output()
  refreshRequested =
    new EventEmitter<void>();


  /* =========================
     OPTIONS
  ========================= */

  readonly kindOptions: Array<{
    value: LeadSchedulingRequestKind;
    label: string;
  }> = [
    {
      value: 'DEMO_CLASS',
      label: 'Demo / cortesía',
    },
    {
      value: 'PLACEMENT_EXAM',
      label: 'Examen de ubicación',
    },
  ];


  readonly statusOptions: Array<{
    value: LeadSchedulingRequestStatus;
    label: string;
  }> = [
    {
      value: 'PENDING',
      label: 'Pendiente',
    },
    {
      value: 'SCHEDULED',
      label: 'Agendada',
    },
    {
      value: 'CANCELLED',
      label: 'Cancelada',
    },
    {
      value: 'COMPLETED',
      label: 'Completada',
    },
  ];


  /* =========================
     CHANGE
  ========================= */

  onKindChange(
    value: '' | LeadSchedulingRequestKind,
  ): void {
    this.kindChange.emit(value);
  }


  onStatusChange(
    value: '' | LeadSchedulingRequestStatus,
  ): void {
    this.statusChange.emit(value);
  }


  /* =========================
     ACTIONS
  ========================= */

  onClear(): void {
    if (this.loading) {
      return;
    }

    this.clearRequested.emit();
  }


  onRefresh(): void {
    if (this.loading) {
      return;
    }

    this.refreshRequested.emit();
  }
}