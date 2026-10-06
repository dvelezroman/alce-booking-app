import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  LeadSchedulingRequestKind,
  LeadSchedulingRequestStatus,
} from '../../../services/dtos/lead-scheduling-request.dto';
import type {
  LeadSchedulingDateField,
  LeadSchedulingListSortBy,
} from '../../../shared/utils/lead-scheduling-request.util';

@Component({
  selector: 'app-instructor-scheduling-request-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './instructor-scheduling-request-filters.component.html',
  styleUrl: './instructor-scheduling-request-filters.component.scss',
})
export class InstructorSchedulingRequestFiltersComponent {
  @Input() searchName: string = '';
  @Input() dateFrom: string = '';
  @Input() dateTo: string = '';
  @Input() sessionTodayOnly: boolean = false;
  @Input() sortBy: LeadSchedulingListSortBy = 'createdAt';
  @Input() dateField: LeadSchedulingDateField = 'session';

  @Input() filterStatus: '' | LeadSchedulingRequestStatus = '';
  @Input() filterKind: '' | LeadSchedulingRequestKind = '';

  @Input() loading: boolean = false;
  @Input() hasActiveFilters: boolean = false;
  /** Assigned inductions are a single kind; hide the tipo dropdown. */
  @Input() showKindFilter: boolean = true;

  @Output() searchNameChange = new EventEmitter<string>();
  @Output() dateFromChange = new EventEmitter<string>();
  @Output() dateToChange = new EventEmitter<string>();
  @Output() sessionTodayOnlyChange = new EventEmitter<boolean>();
  @Output() sortByChange = new EventEmitter<LeadSchedulingListSortBy>();
  @Output() dateFieldChange = new EventEmitter<LeadSchedulingDateField>();

  @Output() filterStatusChange = new EventEmitter<'' | LeadSchedulingRequestStatus>();
  @Output() filterKindChange = new EventEmitter<'' | LeadSchedulingRequestKind>();

  @Output() clientFiltersChange = new EventEmitter<void>();
  @Output() serverFiltersChange = new EventEmitter<void>();
  @Output() dateRangeChange = new EventEmitter<void>();
  @Output() sessionTodayToggle = new EventEmitter<void>();
  @Output() clearFiltersRequested = new EventEmitter<void>();

  readonly statusOptions: {
    value: LeadSchedulingRequestStatus;
    label: string;
  }[] = [
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'SCHEDULED', label: 'Agendada' },
    { value: 'COMPLETED', label: 'Completada' },
    { value: 'CANCELLED', label: 'Cancelada' },
  ];

  readonly kindOptions: {
    value: LeadSchedulingRequestKind;
    label: string;
  }[] = [
    { value: 'DEMO_CLASS', label: 'Cortesía / demo' },
    { value: 'PLACEMENT_EXAM', label: 'Examen de ubicación' },
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

  onSearchChange(value: string): void {
    this.searchName = value;
    this.searchNameChange.emit(value);
    this.clientFiltersChange.emit();
  }

  onStatusChange(
    value: '' | LeadSchedulingRequestStatus,
  ): void {
    this.filterStatus = value;
    this.filterStatusChange.emit(value);
    this.serverFiltersChange.emit();
  }

  onKindChange(
    value: '' | LeadSchedulingRequestKind,
  ): void {
    this.filterKind = value;
    this.filterKindChange.emit(value);
    this.serverFiltersChange.emit();
  }

  onSortByChange(value: LeadSchedulingListSortBy): void {
    this.sortBy = value;
    this.sortByChange.emit(value);
    this.serverFiltersChange.emit();
  }

  onDateFieldChange(value: LeadSchedulingDateField): void {
    this.dateField = value;
    this.dateFieldChange.emit(value);
    if (this.dateFrom || this.dateTo) {
      this.serverFiltersChange.emit();
    }
  }

  onFromDateChange(value: string): void {
    this.dateFrom = value;
    this.dateFromChange.emit(value);

    if (value) {
      this.sessionTodayOnly = false;
      this.sessionTodayOnlyChange.emit(false);
    }

    this.dateRangeChange.emit();
  }

  onToDateChange(value: string): void {
    this.dateTo = value;
    this.dateToChange.emit(value);

    if (value) {
      this.sessionTodayOnly = false;
      this.sessionTodayOnlyChange.emit(false);
    }

    this.dateRangeChange.emit();
  }

  onTodayClick(): void {
    if (this.loading) return;
    this.sessionTodayToggle.emit();
  }

  onClearFilters(): void {
    if (this.loading) return;
    this.clearFiltersRequested.emit();
  }
}
