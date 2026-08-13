import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notification-sent-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './notification-sent-filters.component.html',
  styleUrl: './notification-sent-filters.component.scss',
})
export class NotificationSentFiltersComponent {

  @Input() fromDate = '';
  @Input() toDate = '';

  @Output() fromDateChange = new EventEmitter<string>();
  @Output() toDateChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<void>();


  onFromDateChange(value: string): void {
    this.fromDateChange.emit(value);
  }

  onToDateChange(value: string): void {
    this.toDateChange.emit(value);
  }

  onApplyFilters(): void {
    this.filterChange.emit();
  }

  onClearFilters(): void {
    this.fromDateChange.emit('');
    this.toDateChange.emit('');
    this.filterChange.emit();
  }
}