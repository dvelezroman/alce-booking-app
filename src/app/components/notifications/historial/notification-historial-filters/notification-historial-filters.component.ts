import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import {
  Notification,
} from '../../../../services/dtos/notification.dto';

@Component({
  selector: 'app-notification-historial-filters',
  standalone: true,
  imports: [],
  templateUrl: './notification-historial-filters.component.html',
  styleUrl: './notification-historial-filters.component.scss',
})
export class NotificationHistorialFiltersComponent {

  @Input() showFilters = false;
  @Input() fromDate = '';
  @Input() toDate = '';

  @Input() statusFilter:
    | 'SENT'
    | 'PENDING'
    | 'DELIVERED'
    | 'READ'
    | 'FAILED'
    | '' = '';

  @Input() typeFilter:
    | Notification['notificationType']
    | '' = '';

  @Input() scopeFilter:
    | Notification['scope']
    | '' = '';

  @Input() statusMap: Record<string, string> = {};
  @Input() typeMap: Record<string, string> = {};

  @Output() toggleFilters = new EventEmitter<void>();

  @Output() fromDateChange =
    new EventEmitter<string>();

  @Output() toDateChange =
    new EventEmitter<string>();

  @Output() statusFilterChange =
    new EventEmitter<
      | 'SENT'
      | 'PENDING'
      | 'DELIVERED'
      | 'READ'
      | 'FAILED'
      | ''
    >();

  @Output() typeFilterChange =
    new EventEmitter<
      Notification['notificationType'] | ''
    >();

  @Output() scopeFilterChange =
    new EventEmitter<
      Notification['scope'] | ''
    >();

  @Output() filterChange =
    new EventEmitter<void>();

  onToggleFilters(): void {
    this.toggleFilters.emit();
  }

  onFromDateChange(value: string): void {
    this.fromDateChange.emit(value);
  }

  onToDateChange(value: string): void {
    this.toDateChange.emit(value);
  }

  onStatusFilterChange(value: string): void {
    this.statusFilterChange.emit(
      value as
        | 'SENT'
        | 'PENDING'
        | 'DELIVERED'
        | 'READ'
        | 'FAILED'
        | '',
    );
  }

  onTypeFilterChange(value: string): void {
    this.typeFilterChange.emit(
      value as Notification['notificationType'] | '',
    );
  }

  onScopeFilterChange(value: string): void {
    this.scopeFilterChange.emit(
      value as Notification['scope'] | '',
    );
  }

  onApplyFilters(): void {
    this.filterChange.emit();
  }

  onClearFilters(): void {
    this.fromDateChange.emit('');
    this.toDateChange.emit('');
    this.statusFilterChange.emit('');
    this.typeFilterChange.emit('');
    this.scopeFilterChange.emit('');
    this.filterChange.emit();
  }
}