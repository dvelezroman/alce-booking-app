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
import { RouterModule } from '@angular/router';
import {
  LEAD_SCHEDULING_COURTESY_MONTHLY_REPORT_PATH,
  type LeadSchedulingDateField,
  type LeadSchedulingListSortBy,
} from '../../../shared/utils/lead-scheduling-request.util';

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
    RouterModule,
  ],
  templateUrl: './admin-lead-scheduling-filters.component.html',
  styleUrl: './admin-lead-scheduling-filters.component.scss',
})
export class AdminLeadSchedulingFiltersComponent {
  readonly courtesyReportPath = LEAD_SCHEDULING_COURTESY_MONTHLY_REPORT_PATH;

  @Input()
  filterKind: '' | LeadSchedulingRequestKind = '';

  @Input()
  filterStatus: '' | LeadSchedulingRequestStatus = '';

  @Input()
  sortBy: LeadSchedulingListSortBy = 'createdAt';

  @Input()
  dateField: LeadSchedulingDateField = 'created';

  @Input()
  dateFrom = '';

  @Input()
  dateTo = '';

  @Input()
  loading = false;

  @Output()
  kindChange =
    new EventEmitter<'' | LeadSchedulingRequestKind>();

  @Output()
  statusChange =
    new EventEmitter<'' | LeadSchedulingRequestStatus>();

  @Output()
  sortByChange = new EventEmitter<LeadSchedulingListSortBy>();

  @Output()
  dateFieldChange = new EventEmitter<LeadSchedulingDateField>();

  @Output()
  dateFromChange = new EventEmitter<string>();

  @Output()
  dateToChange = new EventEmitter<string>();

  @Output()
  clearRequested =
    new EventEmitter<void>();

  @Output()
  refreshRequested =
    new EventEmitter<void>();

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
    {
      value: 'INDUCTION',
      label: 'Inducción',
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

  readonly sortByOptions: Array<{
    value: LeadSchedulingListSortBy;
    label: string;
  }> = [
    { value: 'createdAt', label: 'Fecha de registro' },
    { value: 'scheduledSession', label: 'Fecha de sesión' },
  ];

  readonly dateFieldOptions: Array<{
    value: LeadSchedulingDateField;
    label: string;
  }> = [
    { value: 'created', label: 'Registro' },
    { value: 'session', label: 'Sesión' },
  ];

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

  onSortByChange(value: LeadSchedulingListSortBy): void {
    this.sortByChange.emit(value);
  }

  onDateFieldChange(value: LeadSchedulingDateField): void {
    this.dateFieldChange.emit(value);
  }

  onDateFromChange(value: string): void {
    this.dateFromChange.emit(value);
  }

  onDateToChange(value: string): void {
    this.dateToChange.emit(value);
  }

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
