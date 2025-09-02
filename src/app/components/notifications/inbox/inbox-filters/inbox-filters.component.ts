import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface InboxFilters {
  search?: string;
  priorityBucket?: 'all' | 'priority' | 'other';
  readState?: 'all' | 'unread' | 'read';
  fromDate?: string;
  toDate?: string;
}

@Component({
  selector: 'app-inbox-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inbox-filters.component.html',
  styleUrl: './inbox-filters.component.scss',
})
export class InboxFiltersComponent implements OnChanges {
  @Input() value: InboxFilters = {
    search: '',
    priorityBucket: 'all',
    readState: 'all',
    fromDate: '',
    toDate: '',
  };
  @Output() valueChange = new EventEmitter<InboxFilters>();

  searchLocal = '';
  fromDate = '';
  toDate = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.searchLocal = this.value?.search ?? '';
      this.fromDate = this.value?.fromDate ?? '';
      this.toDate = this.value?.toDate ?? '';
    }
  }

  private emit() {
    this.valueChange.emit({ ...this.value });
  }

  handleSearchChange(): void {
    this.value.search = this.searchLocal;
    this.emit();
  }

  setPriorityBucket(bucket: 'all' | 'priority' | 'other') {
    if (this.value.priorityBucket === bucket) return;
    this.value.priorityBucket = bucket;
    this.emit();
  }

  setReadState(state: 'all' | 'unread' | 'read') {
    if (this.value.readState === state) return;
    this.value.readState = state;
    this.emit();
  }

  onDateChange(): void {
    this.value.fromDate = this.fromDate || '';
    this.value.toDate = this.toDate || '';
    this.emit();
  }
}